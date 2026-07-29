DROP POLICY IF EXISTS "Nutritionists can manage custom foods they created" ON public.foods;

CREATE POLICY "Users can insert their own custom foods"
ON public.foods FOR INSERT TO authenticated
WITH CHECK (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Users can update their own custom foods"
ON public.foods FOR UPDATE TO authenticated
USING (is_custom = true AND created_by = auth.uid())
WITH CHECK (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Users can delete their own custom foods"
ON public.foods FOR DELETE TO authenticated
USING (is_custom = true AND created_by = auth.uid());