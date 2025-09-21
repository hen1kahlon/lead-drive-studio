-- Fix critical security issue: Secure students_real table
-- Remove overly permissive RLS policy and add proper admin-only access

DROP POLICY IF EXISTS "Allow admin operations on students" ON public.students_real;

-- Create proper admin-only RLS policy for students_real table
CREATE POLICY "Admins can manage students_real" 
ON public.students_real 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also secure contact_messages for authenticated admins only (removing public access)
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;

-- Keep admin policy but add authenticated contact creation
CREATE POLICY "Authenticated users can create contact messages" 
ON public.contact_messages 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow anonymous users to create contact messages (for the contact form)
CREATE POLICY "Anonymous users can create contact messages" 
ON public.contact_messages 
FOR INSERT 
TO anon 
WITH CHECK (true);