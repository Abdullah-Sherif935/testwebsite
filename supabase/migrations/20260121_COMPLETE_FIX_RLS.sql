-- Complete Fix: Creator Verification System RLS Policies
-- This fixes the "permission denied for table users" error
-- Execute this ENTIRE file in Supabase SQL Editor

-- ========================================
-- STEP 1: Drop all existing policies
-- ========================================
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;

-- ========================================
-- STEP 2: Create user policies (for regular users)
-- ========================================

-- Users can view their own request
CREATE POLICY "Users can view own request"
  ON public.creator_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own request
CREATE POLICY "Users can insert own request"
  ON public.creator_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending request
CREATE POLICY "Users can update own pending request"
  ON public.creator_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- ========================================
-- STEP 3: Create admin policies
-- ========================================

-- Admin can view all requests
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com'
  );

-- Admin can update all requests (approve/reject)
CREATE POLICY "Admin can update all requests"
  ON public.creator_requests FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com'
  );

-- ========================================
-- VERIFICATION: Check if policies are created
-- ========================================
-- Run this to verify: SELECT * FROM pg_policies WHERE tablename = 'creator_requests';
