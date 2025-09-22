-- Ensure profiles and default user role are created on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Allow first authenticated user to become admin automatically
CREATE OR REPLACE FUNCTION public.grant_admin_if_none(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
  inserted boolean := false;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;

  -- Only allow the currently authenticated user to self-assign admin
  IF NOT admin_exists AND _user_id = auth.uid() THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    inserted := true;
  END IF;

  RETURN inserted;
END;
$$;