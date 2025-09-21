-- יצירת טבלת תלמידים אמיתיים עבור בית הספר לנהיגה
CREATE TABLE public.students_real (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'בתהליך לימוד',
  year text NOT NULL DEFAULT '2024',
  passed boolean NOT NULL DEFAULT false,
  theory_test_passed boolean NOT NULL DEFAULT false,
  practical_test_passed boolean NOT NULL DEFAULT false,
  lessons_completed integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students_real ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage all students" 
ON public.students_real 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_students_real_updated_at
  BEFORE UPDATE ON public.students_real
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();