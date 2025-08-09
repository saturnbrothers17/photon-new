-- Create test_results table for storing student test submissions
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
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
CREATE POLICY "Users can view their own test results" ON test_results
    FOR SELECT USING (student_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own test results" ON test_results
    FOR INSERT WITH CHECK (student_id = current_setting('app.current_user_id', true));

-- Allow service role to access all data
CREATE POLICY "Service role can access all test results" ON test_results
    FOR ALL USING (current_setting('role') = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_test_results_updated_at();

-- Grant permissions
GRANT ALL ON test_results TO service_role;
GRANT SELECT, INSERT ON test_results TO authenticated;