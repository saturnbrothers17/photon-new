-- Create study_materials table with minimal required columns
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO study_materials (title, description, subject, file_path, file_type, file_size, uploaded_by) VALUES
('Sample Math Notes', 'Basic algebra concepts', 'Mathematics', 'https://example.com/math.pdf', 'application/pdf', 1024000, 'test-teacher'),
('Physics Formulas', 'Important physics formulas', 'Physics', 'https://example.com/physics.pdf', 'application/pdf', 2048000, 'test-teacher');

-- Check if table exists
SELECT * FROM study_materials LIMIT 5;
