-- Migration: 20260801230000_redesign_patient_schema.sql

-- 1. Tabela patients com dados demograficos proprios (Sem perfis falsos em profiles)
CREATE TABLE IF NOT EXISTS public.patients_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  category text NOT NULL DEFAULT 'comerciario',
  daily_calorie_goal integer DEFAULT 2000,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Copiar dados legados se existirem
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    INSERT INTO public.patients_new (id, nutritionist_id, patient_user_id, full_name, email, phone, category, daily_calorie_goal, notes, created_at, updated_at)
    SELECT 
      p.id,
      p.nutritionist_id,
      CASE WHEN pr.id IS NOT NULL AND pr.role = 'patient' THEN pr.id ELSE NULL END as patient_user_id,
      COALESCE(pr.full_name, 'Paciente Sesc'),
      NULL as email,
      NULL as phone,
      'comerciario' as category,
      COALESCE(p.daily_calorie_goal, 2000),
      p.notes,
      p.created_at,
      p.updated_at
    FROM public.patients p
    LEFT JOIN public.profiles pr ON pr.id = p.patient_id;
  END IF;
END $$;

-- Ajustar FKs em meals para aponta para public.patients_new(id)
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_patient_id_fkey;

DROP TABLE IF EXISTS public.patients CASCADE;
ALTER TABLE public.patients_new RENAME TO patients;

ALTER TABLE public.meals 
  ADD CONSTRAINT meals_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- 2. Tabela de Consentimentos LGPD Auditavel
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

DROP POLICY IF EXISTS "Nutritionists can manage LGPD consents" ON public.lgpd_consents;
CREATE POLICY "Nutritionists can manage LGPD consents"
  ON public.lgpd_consents FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  )
  WITH CHECK (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  );

-- 3. Protecao da Coluna role na Tabela profiles
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

-- Auto-cadastro publico produz exclusivamente 'patient'
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

-- 4. RLS Reforçado para Profiles, Patients, Meals e Meal_Items
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

CREATE POLICY "Users can read relevant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  );

CREATE POLICY "Users can update own profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Patients
DROP POLICY IF EXISTS "Nutritionists can manage their patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can read their own patient records" ON public.patients;

CREATE POLICY "Nutritionists can manage their patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  )
  WITH CHECK (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  );

CREATE POLICY "Patients can read own record"
  ON public.patients FOR SELECT
  TO authenticated
  USING (patient_user_id = auth.uid());

-- RLS Meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage meals of their patients" ON public.meals;
DROP POLICY IF EXISTS "Patients can read their own meals" ON public.meals;

CREATE POLICY "Nutritionists can manage meals"
  ON public.meals FOR ALL
  TO authenticated
  USING (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
  )
  WITH CHECK (
    nutritionist_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist')
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

-- RLS Meal Items
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can insert meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can update meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can delete meal_items" ON public.meal_items;

CREATE POLICY "Authenticated users can select meal_items"
  ON public.meal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND (p.nutritionist_id = auth.uid() OR p.patient_user_id = auth.uid())
    )
  );

CREATE POLICY "Nutritionists can insert meal_items"
  ON public.meal_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.profiles pr ON pr.id = auth.uid()
      WHERE m.id = meal_items.meal_id
        AND m.nutritionist_id = auth.uid()
        AND pr.role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can update meal_items"
  ON public.meal_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.profiles pr ON pr.id = auth.uid()
      WHERE m.id = meal_items.meal_id
        AND m.nutritionist_id = auth.uid()
        AND pr.role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can delete meal_items"
  ON public.meal_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.profiles pr ON pr.id = auth.uid()
      WHERE m.id = meal_items.meal_id
        AND m.nutritionist_id = auth.uid()
        AND pr.role = 'nutritionist'
    )
  );
