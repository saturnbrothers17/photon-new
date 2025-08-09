# Supabase RLS (Row Level Security) Fix Guide

## Problem
The error `new row violates row-level security policy for table "tests"` occurs because Supabase has Row Level Security enabled by default, but no policies are configured to allow operations.

## Quick Fix Options

### Option 1: Disable RLS (Fastest - For Development)

Run this in your Supabase SQL Editor:

```sql
-- Disable RLS on all tables (for development only)
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers DISABLE ROW LEVEL SECURITY;
```

### Option 2: Create Permissive Policies (Recommended)

Run this in your Supabase SQL Editor:

```sql
-- Enable RLS and create permissive policies
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations
CREATE POLICY "Allow all operations" ON tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON test_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON student_answers FOR ALL USING (true) WITH CHECK (true);
```

### Option 3: Use Service Role Key (Most Secure)

1. Get your Service Role Key from Supabase Dashboard:
   - Go to Settings → API
   - Copy the `service_role` key (not the `anon` key)

2. Add it to your `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here
```

3. The code already uses the admin client with this key to bypass RLS.

## Step-by-Step Fix

### 1. Access Supabase SQL Editor
- Go to your Supabase project dashboard
- Click on "SQL Editor" in the left sidebar

### 2. Run the Quick Fix SQL
Copy and paste this SQL and click "Run":

```sql
-- Quick fix: Disable RLS for development
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT ALL ON tests TO anon;
GRANT ALL ON questions TO anon;
GRANT ALL ON test_attempts TO anon;
GRANT ALL ON student_answers TO anon;
```

### 3. Test the Fix
- Go back to your application
- Try creating a test
- It should work without the RLS error

## Understanding the Error

**Row Level Security (RLS)** is a PostgreSQL feature that Supabase enables by default. It means:

- Every row operation (INSERT, UPDATE, DELETE, SELECT) is checked against policies
- If no policies exist or none match, the operation is denied
- This is why you got the "violates row-level security policy" error

## Production Considerations

For production, you should:

1. **Enable RLS** for security
2. **Create specific policies** based on user roles:

```sql
-- Example: Teachers can manage their own tests
CREATE POLICY "Teachers can manage own tests" ON tests
  FOR ALL USING (created_by = auth.uid());

-- Example: Students can only read published tests
CREATE POLICY "Students can read published tests" ON tests
  FOR SELECT USING (is_published = true);
```

3. **Use proper authentication** with Supabase Auth

## Files Updated

The following files have been updated to handle RLS:

- `src/lib/supabase-admin.ts` - Admin client that bypasses RLS
- `src/lib/supabase-data-manager.ts` - Uses admin client for operations
- `supabase-rls-policies.sql` - SQL policies for proper RLS setup
- `supabase-functions.sql` - Database functions that bypass RLS

## Testing

After applying the fix:

1. Visit `/debug` to test authentication
2. Try creating a test from the teacher dashboard
3. Check that tests appear in the manage tests page
4. Verify real-time updates work

## Troubleshooting

If you still get RLS errors:

1. **Check your SQL execution**: Make sure the SQL ran without errors
2. **Verify table permissions**: Run `\dp tests` in SQL editor to see permissions
3. **Check RLS status**: Run `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('tests', 'questions');`
4. **Use Service Role Key**: Add the service role key to your environment variables

## Security Note

⚠️ **Important**: Disabling RLS is fine for development, but for production you should:
- Enable RLS
- Create proper policies based on user roles
- Use Supabase Auth for user management
- Implement proper access controls

The current setup with the admin client and service role key provides a secure way to handle operations while maintaining the flexibility needed for development.