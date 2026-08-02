-- Migration: 20260802010000_structural_patients_rbac_rpc_fix.sql

-- 1. Helper SECURITY DEFINER para verificar se o usuario autenticado e nutricionista (sem recursao em RLS)
CREATE OR REPLACE FUNCTION public.is_nutritionist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'nutritionist'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_nutritionist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_nutritionist() TO authenticated;

-- 2. Adicionar colunas demograficas em patients de forma nao-destrutiva
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS category text DEFAULT 'comerciario';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS patient_user_id uuid;

-- 3. Preencher full_name dos pacientes legados ANTES de deletar perfis ficticios
UPDATE public.patients p
SET full_name = COALESCE(
  p.full_name,
  (SELECT pr.full_name FROM public.profiles pr WHERE pr.id = p.patient_id),
  (CASE WHEN p.notes LIKE '%|%' THEN split_part(p.notes, '|', 1) ELSE 'Paciente Sesc' END)
)
WHERE p.full_name IS NULL OR p.full_name = '';

ALTER TABLE public.patients ALTER COLUMN full_name SET NOT NULL;

-- Preencher patient_user_id apenas para IDs reais em auth.users
UPDATE public.patients p
SET patient_user_id = p.patient_id
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.patient_id);

-- 4. Limpar perfis ficticios (que nao estao em auth.users) e restaurar FK profiles.id -> auth.users.id
DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM auth.users);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Remover TODAS as politicas legadas dependentes de patient_id ANTES de fazer DROP COLUMN
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read relevant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile as patient" ON public.profiles;

DROP POLICY IF EXISTS "Nutritionists can manage their patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can read own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can read their own patient records" ON public.patients;

DROP POLICY IF EXISTS "Nutritionists can manage meals" ON public.meals;
DROP POLICY IF EXISTS "Patients can read own meals" ON public.meals;
DROP POLICY IF EXISTS "Nutritionists can manage meals of their patients" ON public.meals;
DROP POLICY IF EXISTS "Patients can read their own meals" ON public.meals;

DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can insert meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can update meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can delete meal_items" ON public.meal_items;

-- Agora e seguro remover a coluna legada patient_id
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_id_fkey;
ALTER TABLE public.patients DROP COLUMN IF EXISTS patient_id;

ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_user_id_fkey;
ALTER TABLE public.patients
  ADD CONSTRAINT patients_patient_user_id_fkey
  FOREIGN KEY (patient_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Tabela lgpd_consents
CREATE TABLE IF NOT EXISTS public.lgpd_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given boolean NOT NULL DEFAULT true,
  consent_version text NOT NULL DEFAULT 'v1.0-2026',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lgpd_consents TO authenticated;
GRANT ALL ON public.lgpd_consents TO service_role;
ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

-- 7. RPC Transacional com restricoes de seguranca
CREATE OR REPLACE FUNCTION public.create_patient_with_consent(
  p_full_name text,
  p_email text,
  p_phone text,
  p_category text,
  p_daily_calorie_goal integer,
  p_notes text,
  p_lgpd_consent boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_nutritionist_id uuid := auth.uid();
  v_patient_id uuid;
  v_result jsonb;
BEGIN
  IF v_nutritionist_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Usuário não autenticado.';
  END IF;

  IF NOT public.is_nutritionist() THEN
    RAISE EXCEPTION 'Forbidden: Apenas nutricionistas credenciados podem cadastrar pacientes.';
  END IF;

  IF NOT COALESCE(p_lgpd_consent, false) THEN
    RAISE EXCEPTION 'É obrigatório aceitar o termo LGPD para realizar o cadastro.';
  END IF;

  INSERT INTO public.patients (
    nutritionist_id,
    full_name,
    email,
    phone,
    category,
    daily_calorie_goal,
    notes
  ) VALUES (
    v_nutritionist_id,
    p_full_name,
    p_email,
    p_phone,
    COALESCE(p_category, 'comerciario'),
    COALESCE(p_daily_calorie_goal, 2000),
    p_notes
  ) RETURNING id INTO v_patient_id;

  INSERT INTO public.lgpd_consents (
    patient_id,
    nutritionist_id,
    consent_given,
    consent_version
  ) VALUES (
    v_patient_id,
    v_nutritionist_id,
    true,
    'v1.0-2026'
  );

  SELECT row_to_json(p)::jsonb INTO v_result FROM public.patients p WHERE p.id = v_patient_id;
  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_patient_with_consent(text, text, text, text, integer, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_patient_with_consent(text, text, text, text, integer, text, boolean) TO authenticated;

-- 8. Protecao contra elevação de papel no INSERT e UPDATE de profiles
CREATE OR REPLACE FUNCTION public.force_profile_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF current_setting('role', true) != 'service_role' THEN
    NEW.role := 'patient'::public.app_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_force_profile_role_on_insert ON public.profiles;
CREATE TRIGGER tr_force_profile_role_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.force_profile_role_on_insert();

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND current_setting('role', true) != 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_profile_role_change ON public.profiles;
CREATE TRIGGER tr_prevent_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- 9. Novas Politicas RLS Seguras Sem Recursao
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read relevant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.is_nutritionist()
  );

CREATE POLICY "Users can insert own profile as patient"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid() AND (role = 'patient'::public.app_role OR role IS NULL)
  );

CREATE POLICY "Users can update own profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage their patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  );

CREATE POLICY "Patients can read own record"
  ON public.patients FOR SELECT
  TO authenticated
  USING (patient_user_id = auth.uid());

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage meals"
  ON public.meals FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  );

CREATE POLICY "Patients can read own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = meals.patient_id AND p.patient_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Nutritionists can manage LGPD consents" ON public.lgpd_consents;
CREATE POLICY "Nutritionists can manage LGPD consents"
  ON public.lgpd_consents FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist()
  );
