-- Migration: 20260802130000_fix_meal_items_rls_and_repair.sql

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
    WHERE id = auth.uid() AND role = 'nutritionist'::public.app_role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_nutritionist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_nutritionist() TO authenticated;

-- 2. Garantir RPC transacional de cadastro com consentimento LGPD
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

-- 3. Remover politicas antigas e incorretas de meal_items
DROP POLICY IF EXISTS "Nutritionists can manage meal items for their patients" ON public.meal_items;
DROP POLICY IF EXISTS "Patients can read their own meal items" ON public.meal_items;
DROP POLICY IF EXISTS "Nutritionists can manage meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Patients can read own meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can select meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can insert meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can update meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Authenticated users can delete meal_items" ON public.meal_items;

-- 4. Criar politicas RLS corretas com validação RBAC e patient_user_id para meal_items
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage meal_items"
  ON public.meal_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_items.meal_id AND m.nutritionist_id = auth.uid()
    ) AND public.is_nutritionist()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_items.meal_id AND m.nutritionist_id = auth.uid()
    ) AND public.is_nutritionist()
  );

CREATE POLICY "Patients can read own meal_items"
  ON public.meal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      JOIN public.patients p ON p.id = m.patient_id
      WHERE m.id = meal_items.meal_id AND p.patient_user_id = auth.uid()
    )
  );
