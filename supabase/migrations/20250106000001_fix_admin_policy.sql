-- Fix admin policy for comments table
-- Drop the existing admin policy that depends on users table
DROP POLICY IF EXISTS "Admins can manage all comments" ON "public"."comments";

-- Create a new admin policy that checks email directly
CREATE POLICY "Admin can manage all comments"
ON "public"."comments"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'email') = 'nicolas.sursock@gmail.com'
)
WITH CHECK (
    (auth.jwt() ->> 'email') = 'nicolas.sursock@gmail.com'
);

-- Also make sure service_role can bypass RLS entirely
-- (This should already be the case, but let's be explicit)
GRANT ALL ON "public"."comments" TO service_role; 