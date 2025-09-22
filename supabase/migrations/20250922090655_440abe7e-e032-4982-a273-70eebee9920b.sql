-- Allow public read access to students_real table
DROP POLICY IF EXISTS "Admins can manage students_real" ON public.students_real;

-- Create new policies for public read access
CREATE POLICY "Anyone can view students" 
ON public.students_real 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage students_real" 
ON public.students_real 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));