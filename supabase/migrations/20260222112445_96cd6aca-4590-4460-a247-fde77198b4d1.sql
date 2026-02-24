-- Add user_id column to transactions
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing rows to NULL (will be updated on next login)
-- Drop old permissive policy
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;

-- Create proper RLS policies
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
