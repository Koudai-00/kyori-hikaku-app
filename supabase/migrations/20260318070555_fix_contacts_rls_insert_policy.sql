/*
  # Fix contacts RLS INSERT policy

  ## Summary
  Replaces the overly permissive `Anyone can insert contacts` policy (WITH CHECK always true)
  with a restricted policy that validates required fields are non-empty.

  ## Changes
  - Drops the old unrestricted INSERT policy for anon users
  - Creates a new INSERT policy that requires name, email, subject, and message to be non-empty strings
  - This prevents empty/junk submissions while still allowing legitimate contact form submissions

  ## Security
  - Anon users can only insert if all required fields contain non-empty values
  - Service role policy remains unchanged and allows full access
*/

DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;

CREATE POLICY "Anon can insert valid contacts"
  ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0 AND email LIKE '%@%'
    AND subject IS NOT NULL AND length(trim(subject)) > 0
    AND message IS NOT NULL AND length(trim(message)) > 0
  );
