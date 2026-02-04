-- ================================================
-- IT Support Dashboard - Database Security Setup
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TICKETS TABLE POLICIES
-- ================================================

-- Allow public to INSERT tickets (for submission form at /submit)
CREATE POLICY "Public can submit tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view tickets
CREATE POLICY "Authenticated users can view tickets" ON tickets
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update tickets
CREATE POLICY "Authenticated users can update tickets" ON tickets
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Only authenticated users can delete tickets
CREATE POLICY "Authenticated users can delete tickets" ON tickets
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ================================================
-- ASSETS TABLE POLICIES
-- ================================================

CREATE POLICY "Authenticated users full access to assets" ON assets
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- DOMAINS TABLE POLICIES
-- ================================================

CREATE POLICY "Authenticated users full access to domains" ON domains
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- HOSTING ACCOUNTS TABLE POLICIES
-- ================================================

CREATE POLICY "Authenticated users full access to hosting_accounts" ON hosting_accounts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- EMAIL ACCOUNTS TABLE POLICIES
-- ================================================

CREATE POLICY "Authenticated users full access to email_accounts" ON email_accounts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- SOLUTIONS TABLE POLICIES
-- ================================================

CREATE POLICY "Authenticated users full access to solutions" ON solutions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View all policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
