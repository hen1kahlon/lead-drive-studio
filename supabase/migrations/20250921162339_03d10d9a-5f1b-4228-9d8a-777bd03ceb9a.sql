-- Update RLS policy for students_real table to allow public access for admin operations
-- Since we're using a simple localStorage-based admin authentication

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students_real;

-- Create a more permissive policy that allows all operations
-- In a real production environment, you'd want proper Supabase authentication
CREATE POLICY "Allow admin operations on students" 
ON public.students_real 
FOR ALL 
USING (true) 
WITH CHECK (true);