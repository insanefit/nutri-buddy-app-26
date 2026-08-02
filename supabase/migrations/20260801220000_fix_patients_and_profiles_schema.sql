-- Migration: 20260801220000_fix_patients_and_profiles_schema.sql

-- 1. Remove restricoes de Foreign Key rigidas de auth.users em patients
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_id_fkey;
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_nutritionist_id_patient_id_key;
ALTER TABLE public.patients ALTER COLUMN patient_id DROP NOT NULL;

-- 2. Remove restricao de Foreign Key rigida de auth.users em profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Atualiza RLS de profiles para permitir insercao e leitura por usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
CREATE POLICY "Authenticated users can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Atualiza trigger handle_new_user() para forçar role 'patient' por padrão no auto-cadastro público
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

-- 5. Atualiza RLS de meal_items: LEITURA para Pacientes e Nutricionistas, MUTAÇÃO exclusiva para Nutricionista
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can insert meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can update meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can delete meal_items" ON public.meal_items;

-- SELECT: Nutricionista responsavel OU Paciente proprietario
CREATE POLICY "Authenticated users can select meal_items"
  ON public.meal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND (p.nutritionist_id = auth.uid() OR p.patient_id = auth.uid())
    )
  );

-- INSERT: Estritamente para o Nutricionista responsavel
CREATE POLICY "Nutritionists can insert meal_items"
  ON public.meal_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND p.nutritionist_id = auth.uid()
    )
  );

-- UPDATE: Estritamente para o Nutricionista responsavel
CREATE POLICY "Nutritionists can update meal_items"
  ON public.meal_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND p.nutritionist_id = auth.uid()
    )
  );

-- DELETE: Estritamente para o Nutricionista responsavel
CREATE POLICY "Nutritionists can delete meal_items"
  ON public.meal_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND p.nutritionist_id = auth.uid()
    )
  );
