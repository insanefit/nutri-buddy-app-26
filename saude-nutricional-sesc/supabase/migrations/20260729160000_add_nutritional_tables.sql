-- Migration: Add Nutritional Tables (Foods, Prescriptions, Prescription Items)
-- Integrated from NutriBuddy into Saúde Nutricional Sesc

-- 1. Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories_per_100g numeric(8,2) NOT NULL DEFAULT 0,
  protein_per_100g numeric(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g numeric(8,2) NOT NULL DEFAULT 0,
  fat_per_100g numeric(8,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'g',
  is_custom boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read foods"
  ON public.foods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert custom foods"
  ON public.foods FOR INSERT
  TO authenticated
  WITH CHECK (is_custom = true AND created_by = (SELECT auth.uid()));

CREATE POLICY "Users can update own custom foods"
  ON public.foods FOR UPDATE
  TO authenticated
  USING (is_custom = true AND created_by = (SELECT auth.uid()))
  WITH CHECK (is_custom = true AND created_by = (SELECT auth.uid()));

CREATE POLICY "Users can delete own custom foods"
  ON public.foods FOR DELETE
  TO authenticated
  USING (is_custom = true AND created_by = (SELECT auth.uid()));

-- High Performance Indexes for Foods
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods (name);
CREATE INDEX IF NOT EXISTS idx_foods_created_by ON public.foods (created_by) WHERE created_by IS NOT NULL;

-- 2. Prescriptions Table (Plano Alimentar)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists and Coordinators can view prescriptions"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nutritionists can insert prescriptions"
  ON public.prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (nutritionist_id = (SELECT auth.uid()));

CREATE POLICY "Nutritionists can update own prescriptions"
  ON public.prescriptions FOR UPDATE
  TO authenticated
  USING (nutritionist_id = (SELECT auth.uid()))
  WITH CHECK (nutritionist_id = (SELECT auth.uid()));

-- High Performance Indexes for Prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_nutritionist ON public.prescriptions (nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_unit ON public.prescriptions (unit_id);

-- 3. Prescription Items Table (Itens do Plano Alimentar)
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  meal_name text NOT NULL DEFAULT 'Café da Manhã',
  quantity_grams numeric(8,2) NOT NULL DEFAULT 100,
  calculated_calories numeric(8,2) NOT NULL DEFAULT 0,
  calculated_protein numeric(8,2) NOT NULL DEFAULT 0,
  calculated_carbs numeric(8,2) NOT NULL DEFAULT 0,
  calculated_fat numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescription_items TO authenticated;
GRANT ALL ON public.prescription_items TO service_role;

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view prescription items"
  ON public.prescription_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage prescription items"
  ON public.prescription_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.id = prescription_items.prescription_id AND p.nutritionist_id = (SELECT auth.uid())
    )
  );

-- High Performance Index for Prescription Items
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON public.prescription_items (prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_food ON public.prescription_items (food_id);

-- 4. Seed Staple Brazilian Foods
INSERT INTO public.foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_custom)
VALUES
  ('Arroz branco cozido', 130, 2.7, 28.0, 0.2, false),
  ('Feijão carioca cozido', 76, 4.5, 13.6, 0.5, false),
  ('Peito de frango grelhado', 165, 31.0, 0, 3.6, false),
  ('Ovo cozido', 155, 13.0, 1.1, 11.0, false),
  ('Batata doce cozida', 86, 1.6, 20.1, 0.1, false),
  ('Brócolis cozido', 35, 2.4, 7.2, 0.4, false),
  ('Salada de alface e tomate', 22, 1.0, 4.0, 0.3, false),
  ('Pão francês', 300, 8.0, 58.0, 3.0, false),
  ('Banana prata', 89, 1.1, 22.8, 0.3, false),
  ('Iogurte natural desnatado', 56, 5.0, 7.0, 0.5, false),
  ('Aveia em flocos', 389, 16.9, 66.0, 6.9, false),
  ('Leite desnatado', 35, 3.4, 5.0, 0.1, false),
  ('Salmão grelhado', 208, 20.0, 0, 13.0, false),
  ('Abacate', 160, 2.0, 8.5, 14.7, false),
  ('Tapioca', 154, 0.3, 38.0, 0.1, false);
