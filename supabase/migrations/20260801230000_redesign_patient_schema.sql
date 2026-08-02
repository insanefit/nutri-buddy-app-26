-- Migration: 20260801230000_redesign_patient_schema.sql

-- 1. Helper SECURITY DEFINER para checar perfil de nutricionista sem recursão em RLS
CREATE OR REPLACE FUNCTION public.is_nutritionist(lookup_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_id AND role = 'nutritionist'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_nutritionist TO authenticated;

-- 2. Alteração segura e não-destrutiva da tabela patients (adicionar colunas primeiro)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS category text DEFAULT 'comerciario';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS patient_user_id uuid;

-- Preencher full_name, email, phone, category a partir de profiles/notes legados ANTES de apagar perfis fictícios
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='patients' AND column_name='patient_id'
  ) THEN
    UPDATE public.patients p
    SET
      full_name = COALESCE(
        NULLIF(p.full_name, ''),
        (SELECT pr.full_name FROM public.profiles pr WHERE pr.id = p.patient_id),
        (CASE WHEN p.notes LIKE '%|%' THEN split_part(p.notes, '|', 1) ELSE 'Paciente Sesc' END)
      ),
      email = COALESCE(
        NULLIF(p.email, ''),
        (CASE
          WHEN p.notes LIKE '%@%' AND p.notes LIKE '%|%' THEN split_part(p.notes, '|', 2)
          WHEN p.notes LIKE '%@%' THEN substring(p.notes from '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
          ELSE NULL
        END)
      ),
      phone = COALESCE(
        NULLIF(p.phone, ''),
        (CASE
          WHEN p.notes LIKE '%|%' AND array_length(string_to_array(p.notes, '|'), 1) >= 3 THEN split_part(p.notes, '|', 3)
          ELSE NULL
        END)
      ),
      category = COALESCE(
        NULLIF(p.category, ''),
        (CASE
          WHEN lower(p.notes) LIKE '%dependente%' THEN 'dependente'
          WHEN lower(p.notes) LIKE '%público geral%' OR lower(p.notes) LIKE '%publico_geral%' THEN 'publico_geral'
          ELSE 'comerciario'
        END)
      );

    -- Associar patient_user_id apenas para IDs reais em auth.users
    UPDATE public.patients p
    SET patient_user_id = p.patient_id
    WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.patient_id);
  ELSE
    UPDATE public.patients p
    SET
      full_name = COALESCE(NULLIF(p.full_name, ''), 'Paciente Sesc'),
      category = COALESCE(
        NULLIF(p.category, ''),
        (CASE
          WHEN lower(p.notes) LIKE '%dependente%' THEN 'dependente'
          WHEN lower(p.notes) LIKE '%público geral%' OR lower(p.notes) LIKE '%publico_geral%' THEN 'publico_geral'
          ELSE 'comerciario'
        END)
      );
  END IF;
END $$;

UPDATE public.patients SET full_name = 'Paciente Sesc' WHERE full_name IS NULL OR full_name = '';
ALTER TABLE public.patients ALTER COLUMN full_name SET NOT NULL;

-- 3. Limpar perfis fictícios (que não estão em auth.users) SOMENTE APÓS preservar os nomes
DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM auth.users);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Patients can read their own patient records" ON public.patients;
DROP POLICY IF EXISTS "Patients can read own record" ON public.patients;
DROP POLICY IF EXISTS "Patients can read their own meals" ON public.meals;
DROP POLICY IF EXISTS "Patients can read own meals" ON public.meals;
DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can manage meal items for their patients" ON public.meal_items;
DROP POLICY IF EXISTS "Patients can read their own meal items" ON public.meal_items;

ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_id_fkey;
ALTER TABLE public.patients DROP COLUMN IF EXISTS patient_id;

ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_user_id_fkey;
ALTER TABLE public.patients
  ADD CONSTRAINT patients_patient_user_id_fkey
  FOREIGN KEY (patient_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Tabela lgpd_consents
CREATE TABLE IF NOT EXISTS public.lgpd_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given boolean NOT NULL DEFAULT true,
  consent_version text NOT NULL DEFAULT 'v1.0-2026',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Migrar consentimentos legados de pacientes para lgpd_consents
INSERT INTO public.lgpd_consents (patient_id, nutritionist_id, consent_given, consent_version)
SELECT p.id, p.nutritionist_id, true, 'v1.0-legacy'
FROM public.patients p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lgpd_consents c WHERE c.patient_id = p.id
);

GRANT SELECT, INSERT ON public.lgpd_consents TO authenticated;
GRANT ALL ON public.lgpd_consents TO service_role;
ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

-- 5. RPC Transacional para cadastrar paciente + consentimento LGPD em transação atômica
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
SET search_path = public
AS $$
DECLARE
  v_nutritionist_id uuid := auth.uid();
  v_patient_id uuid;
  v_result jsonb;
BEGIN
  IF v_nutritionist_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Usuário não autenticado.';
  END IF;

  IF NOT public.is_nutritionist(v_nutritionist_id) THEN
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

GRANT EXECUTE ON FUNCTION public.create_patient_with_consent TO authenticated;

-- 6. Trigger para impedir alteração manual da coluna role em profiles por usuários comuns
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 7. Trigger para garantir que auto-cadastro público cria apenas 'patient'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'patient'::public.app_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Políticas RLS Sem Recursão Infinita
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read relevant profiles" ON public.profiles;

CREATE POLICY "Users can read relevant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.is_nutritionist(auth.uid())
  );

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage their patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can read own record" ON public.patients;

CREATE POLICY "Nutritionists can manage their patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
  );

CREATE POLICY "Patients can read own record"
  ON public.patients FOR SELECT
  TO authenticated
  USING (patient_user_id = auth.uid());

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage meals" ON public.meals;
DROP POLICY IF EXISTS "Patients can read own meals" ON public.meals;

CREATE POLICY "Nutritionists can manage meals"
  ON public.meals FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
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
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
  )
  WITH CHECK (
    nutritionist_id = auth.uid() AND public.is_nutritionist(auth.uid())
  );
