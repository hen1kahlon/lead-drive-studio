-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student', 'user');

-- Create enum for lesson status
CREATE TYPE public.lesson_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- Create enum for lesson types
CREATE TYPE public.lesson_type AS ENUM ('theory', 'practical', 'test_preparation', 'mock_test');

-- Create enum for vehicle types
CREATE TYPE public.vehicle_type AS ENUM ('manual', 'automatic');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create instructors table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  specializations lesson_type[] DEFAULT ARRAY['practical']::lesson_type[],
  years_of_experience INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theory_test_passed BOOLEAN DEFAULT false,
  practical_test_passed BOOLEAN DEFAULT false,
  total_lessons INTEGER DEFAULT 0,
  current_instructor_id UUID REFERENCES public.instructors(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  last_maintenance DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  lesson_type lesson_type NOT NULL DEFAULT 'practical',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status lesson_status NOT NULL DEFAULT 'scheduled',
  pickup_location TEXT,
  notes TEXT,
  instructor_notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table for contact form submissions
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for instructors table
CREATE POLICY "Instructors can view their own data"
ON public.instructors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Instructors can update their own data"
ON public.instructors FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active instructors"
ON public.instructors FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all instructors"
ON public.instructors FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for students table
CREATE POLICY "Students can view their own data"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own data"
ON public.students FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own data"
ON public.students FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can view their students"
ON public.students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.instructors
    WHERE instructors.user_id = auth.uid()
    AND instructors.id = students.current_instructor_id
  )
);

CREATE POLICY "Admins can manage all students"
ON public.students FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vehicles table
CREATE POLICY "Active vehicles are viewable by authenticated users"
ON public.vehicles FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage all vehicles"
ON public.vehicles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lessons table
CREATE POLICY "Students can view their own lessons"
ON public.lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.user_id = auth.uid()
    AND students.id = lessons.student_id
  )
);

CREATE POLICY "Instructors can view their lessons"
ON public.lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.instructors
    WHERE instructors.user_id = auth.uid()
    AND instructors.id = lessons.instructor_id
  )
);

CREATE POLICY "Students can book lessons"
ON public.lessons FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.user_id = auth.uid()
    AND students.id = lessons.student_id
  )
);

CREATE POLICY "Instructors can update their lessons"
ON public.lessons FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.instructors
    WHERE instructors.user_id = auth.uid()
    AND instructors.id = lessons.instructor_id
  )
);

CREATE POLICY "Admins can manage all lessons"
ON public.lessons FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews table
CREATE POLICY "Public can view public reviews"
ON public.reviews FOR SELECT
USING (is_public = true);

CREATE POLICY "Students can create reviews for their lessons"
ON public.reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.user_id = auth.uid()
    AND students.id = reviews.student_id
  )
);

CREATE POLICY "Students can update their own reviews"
ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.user_id = auth.uid()
    AND students.id = reviews.student_id
  )
);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_messages table
CREATE POLICY "Anyone can create contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all contact messages"
ON public.contact_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Set default role as 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_instructors_user_id ON public.instructors(user_id);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_instructor_id ON public.lessons(instructor_id);
CREATE INDEX idx_lessons_scheduled_date ON public.lessons(scheduled_date);
CREATE INDEX idx_reviews_instructor_id ON public.reviews(instructor_id);
CREATE INDEX idx_reviews_is_public ON public.reviews(is_public);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX idx_contact_messages_is_read ON public.contact_messages(is_read);