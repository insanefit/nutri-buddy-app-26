-- Fix handle_new_user() trigger to safely cast role or default to 'nutritionist'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role := 'nutritionist';
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'patient' THEN
    assigned_role := 'patient';
  ELSE
    assigned_role := 'nutritionist';
  END IF;

  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix RLS policy for meals so patients can read their own meals
DROP POLICY IF EXISTS "Patients can read their own meals" ON public.meals;

CREATE POLICY "Patients can read their own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = meals.patient_id AND p.patient_id = auth.uid()
    )
  );
