-- Advanced Dashboard Schema for Teacher-Student Platform
-- Run this SQL script in your Supabase SQL Editor

-- 1. Study Materials Table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    class_level TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'teacher',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Live Tests Table (for ongoing tests)
CREATE TABLE IF NOT EXISTS live_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 100,
    current_participants INTEGER DEFAULT 0,
    instructions TEXT,
    created_by TEXT NOT NULL DEFAULT 'teacher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Test Participants Table (for live test tracking)
CREATE TABLE IF NOT EXISTS test_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_test_id UUID REFERENCES live_tests(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'in_progress', 'submitted', 'left')),
    current_question INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Student Rankings Table
CREATE TABLE IF NOT EXISTS student_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_result_id TEXT REFERENCES test_results(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    rank INTEGER NOT NULL,
    total_participants INTEGER NOT NULL,
    percentile DECIMAL(5,2) NOT NULL,
    time_taken INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Material Views Table (for tracking study material access)
CREATE TABLE IF NOT EXISTS material_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_duration INTEGER DEFAULT 0,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Test Schedules Table
CREATE TABLE IF NOT EXISTS test_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 180,
    instructions TEXT,
    is_published BOOLEAN DEFAULT false,
    max_attempts INTEGER DEFAULT 1,
    auto_start BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL DEFAULT 'teacher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_class_level ON study_materials(class_level);
CREATE INDEX IF NOT EXISTS idx_study_materials_active ON study_materials(is_active);
CREATE INDEX IF NOT EXISTS idx_live_tests_active ON live_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_live_tests_time ON live_tests(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_test_participants_live_test ON test_participants(live_test_id);
CREATE INDEX IF NOT EXISTS idx_test_participants_student ON test_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_test ON student_rankings(test_id);
CREATE INDEX IF NOT EXISTS idx_student_rankings_student ON student_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_material_views_material ON material_views(material_id);
CREATE INDEX IF NOT EXISTS idx_material_views_student ON material_views(student_id);
CREATE INDEX IF NOT EXISTS idx_test_schedules_date ON test_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_test_schedules_published ON test_schedules(is_published);

-- Enable RLS (Row Level Security)
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for service role" ON study_materials FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON live_tests FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON test_participants FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON student_rankings FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON material_views FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON test_schedules FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON study_materials TO service_role;
GRANT ALL ON live_tests TO service_role;
GRANT ALL ON test_participants TO service_role;
GRANT ALL ON student_rankings TO service_role;
GRANT ALL ON material_views TO service_role;
GRANT ALL ON test_schedules TO service_role;

GRANT ALL ON study_materials TO authenticated;
GRANT ALL ON live_tests TO authenticated;
GRANT ALL ON test_participants TO authenticated;
GRANT ALL ON student_rankings TO authenticated;
GRANT ALL ON material_views TO authenticated;
GRANT ALL ON test_schedules TO authenticated;

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_tests_updated_at BEFORE UPDATE ON live_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_participants_updated_at BEFORE UPDATE ON test_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rankings_updated_at BEFORE UPDATE ON student_rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_schedules_updated_at BEFORE UPDATE ON test_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate rankings
CREATE OR REPLACE FUNCTION calculate_test_rankings(test_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete existing rankings for this test
    DELETE FROM student_rankings WHERE test_id = test_uuid;
    
    -- Calculate and insert new rankings
    WITH ranked_results AS (
        SELECT 
            tr.id as test_result_id,
            tr.student_id,
            tr.test_id,
            tr.score,
            tr.max_marks as max_score,
            ROUND((tr.score::DECIMAL / tr.max_marks::DECIMAL) * 100, 2) as percentage,
            tr.time_taken,
            ROW_NUMBER() OVER (ORDER BY tr.score DESC, tr.time_taken ASC) as rank,
            COUNT(*) OVER () as total_participants
        FROM test_results tr
        WHERE tr.test_id = test_uuid
    )
    INSERT INTO student_rankings (
        test_result_id, student_id, test_id, score, max_score, 
        percentage, rank, total_participants, percentile, time_taken
    )
    SELECT 
        test_result_id, student_id, test_id, score, max_score,
        percentage, rank, total_participants,
        ROUND(((total_participants - rank + 1)::DECIMAL / total_participants::DECIMAL) * 100, 2) as percentile,
        time_taken
    FROM ranked_results;
END;
$$ LANGUAGE plpgsql;

-- Function to update material view count
CREATE OR REPLACE FUNCTION increment_material_views(material_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE study_materials 
    SET view_count = view_count + 1 
    WHERE id = material_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO study_materials (title, description, subject, class_level, file_url, file_name, file_size, file_type) VALUES
('Physics Formula Sheet', 'Complete formula sheet for JEE Physics', 'Physics', 'Class 12', '/materials/physics-formulas.pdf', 'physics-formulas.pdf', 2048576, 'application/pdf'),
('Organic Chemistry Notes', 'Comprehensive notes on Organic Chemistry reactions', 'Chemistry', 'Class 12', '/materials/organic-chemistry.pdf', 'organic-chemistry.pdf', 3145728, 'application/pdf'),
('Calculus Practice Problems', 'Advanced calculus problems with solutions', 'Mathematics', 'Class 12', '/materials/calculus-problems.pdf', 'calculus-problems.pdf', 1572864, 'application/pdf')
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('study_materials', 'live_tests', 'test_participants', 'student_rankings', 'material_views', 'test_schedules')
ORDER BY table_name, ordinal_position;