-- Add 'mentor' role to users_role_check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'teacher'::text, 'mentor'::text, 'admin'::text]));
