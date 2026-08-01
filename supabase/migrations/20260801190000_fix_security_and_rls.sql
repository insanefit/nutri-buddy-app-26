-- Migration: 20260801190000_fix_security_and_rls.sql
-- Fix RBAC trigger for new users: default to 'patient' on self signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always default new self-registered users to 'patient' role for RBAC security
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

-- Enable RLS on meal_items table
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on meal_items if any
DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can insert meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can update meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can delete meal_items" ON public.meal_items;

-- RLS Policy: Select meal items
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

-- RLS Policy: Insert meal items
CREATE POLICY "Authenticated users can insert meal_items"
  ON public.meal_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND (p.nutritionist_id = auth.uid() OR p.patient_id = auth.uid())
    )
  );

-- RLS Policy: Update meal items
CREATE POLICY "Authenticated users can update meal_items"
  ON public.meal_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND (p.nutritionist_id = auth.uid() OR p.patient_id = auth.uid())
    )
  );

-- RLS Policy: Delete meal items
CREATE POLICY "Authenticated users can delete meal_items"
  ON public.meal_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id
        AND (p.nutritionist_id = auth.uid() OR p.patient_id = auth.uid())
    )
  );
