# 🗄️ Setup Test Results Table

## Quick Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Click **New Query**

### Step 2: Run the SQL Script
Copy and paste the following SQL script and click **Run**:

```sql
-- Create test_results table for storing student test submissions
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_id UUID,
    student_id TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_taken INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    attempted_questions INTEGER NOT NULL DEFAULT 0,
    flagged_questions JSONB DEFAULT '[]',
    test_name TEXT,
    test_type TEXT,
    score INTEGER DEFAULT 0,
    max_marks INTEGER DEFAULT 0,
    security_report JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_submitted_at ON test_results(submitted_at);

-- Enable RLS (Row Level Security)
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for service role" ON test_results
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON test_results TO service_role;
GRANT ALL ON test_results TO authenticated;
```

### Step 3: Verify Table Creation
1. Go to **Table Editor** tab
2. You should see `test_results` table listed
3. Click on it to verify the structure

### Step 4: Test the System
1. Take a test in secure mode
2. Submit the test
3. Click "View Results" to see the analysis

## Alternative: Manual Table Creation

If the SQL script doesn't work, you can create the table manually:

1. Go to **Table Editor** → **New Table**
2. Table name: `test_results`
3. Add these columns:

| Column Name | Type | Default | Nullable |
|-------------|------|---------|----------|
| id | text | - | No (Primary Key) |
| test_id | uuid | - | Yes |
| student_id | text | - | No |
| answers | jsonb | {} | No |
| submitted_at | timestamptz | now() | No |
| time_taken | int4 | 0 | No |
| total_questions | int4 | 0 | No |
| attempted_questions | int4 | 0 | No |
| flagged_questions | jsonb | [] | Yes |
| test_name | text | - | Yes |
| test_type | text | - | Yes |
| score | int4 | 0 | Yes |
| max_marks | int4 | 0 | Yes |
| security_report | jsonb | {} | Yes |
| created_at | timestamptz | now() | No |
| updated_at | timestamptz | now() | No |

## Troubleshooting

### Error: "Could not find the table"
- Make sure you ran the SQL script in the correct project
- Check if the table appears in Table Editor
- Verify your environment variables are correct

### Error: "Permission denied"
- Make sure RLS policies are set correctly
- Check that service_role has proper permissions
- Verify your Supabase keys in .env.local

### Still Having Issues?
The system will work with localStorage as fallback if the database table is not available.