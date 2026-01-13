-- Fix RLS Policy for Admin Manager Profile Updates
-- This ensures admins can properly revoke manager approvals
-- Run this in Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can update manager profiles" ON manager_profiles;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "Admins can update manager profiles" ON manager_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'manager_profiles' 
AND policyname = 'Admins can update manager profiles';
