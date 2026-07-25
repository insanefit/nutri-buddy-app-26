ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_nutritionist_id_fkey;
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_patient_id_fkey;
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_nutritionist_id_fkey;
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_patient_id_fkey;
ALTER TABLE public.foods DROP CONSTRAINT IF EXISTS foods_created_by_fkey;

ALTER TABLE public.patients ADD CONSTRAINT patients_nutritionist_id_fkey FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.patients ADD CONSTRAINT patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.meals ADD CONSTRAINT meals_nutritionist_id_fkey FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.meals ADD CONSTRAINT meals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.foods ADD CONSTRAINT foods_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;