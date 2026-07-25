CREATE TYPE public.app_role AS ENUM ('nutritionist', 'patient');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role public.app_role NOT NULL DEFAULT 'patient',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_goal integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nutritionist_id, patient_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage their patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (nutritionist_id = auth.uid())
  WITH CHECK (nutritionist_id = auth.uid());

CREATE POLICY "Patients can read their own patient records"
  ON public.patients FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE TABLE public.foods (
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

CREATE POLICY "Authenticated users can read all foods"
  ON public.foods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nutritionists can manage custom foods they created"
  ON public.foods FOR ALL
  TO authenticated
  USING (is_custom = false OR created_by = auth.uid())
  WITH CHECK (is_custom = false OR created_by = auth.uid());

CREATE TABLE public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  meal_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals TO authenticated;
GRANT ALL ON public.meals TO service_role;

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage meals of their patients"
  ON public.meals FOR ALL
  TO authenticated
  USING (nutritionist_id = auth.uid())
  WITH CHECK (nutritionist_id = auth.uid());

CREATE POLICY "Patients can read their own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE TABLE public.meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  quantity_grams numeric(8,2) NOT NULL DEFAULT 100,
  calculated_calories numeric(8,2) NOT NULL DEFAULT 0,
  calculated_protein numeric(8,2) NOT NULL DEFAULT 0,
  calculated_carbs numeric(8,2) NOT NULL DEFAULT 0,
  calculated_fat numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_items TO authenticated;
GRANT ALL ON public.meal_items TO service_role;

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage meal items for their patients"
  ON public.meal_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_items.meal_id AND m.nutritionist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_items.meal_id AND m.nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Patients can read their own meal items"
  ON public.meal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_items.meal_id AND m.patient_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_items_updated_at BEFORE UPDATE ON public.meal_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed common foods (Brazilian staples, per 100g)
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
  ('Banana', 89, 1.1, 22.8, 0.3, false),
  ('Iogurte natural desnatado', 56, 5.0, 7.0, 0.5, false),
  ('Aveia em flocos', 389, 16.9, 66.0, 6.9, false),
  ('Leite desnatado', 35, 3.4, 5.0, 0.1, false),
  ('Salmão grelhado', 208, 20.0, 0, 13.0, false),
  ('Abacate', 160, 2.0, 8.5, 14.7, false),
  ('Tapioca', 154, 0.3, 38.0, 0.1, false);