# Manual SQL Commands for Supabase

## 🎯 Run these commands in your Supabase SQL Editor

Copy and paste each section below into your Supabase SQL Editor and run them one by one.

---

## 1️⃣ **Fix Tests Table - Add Missing Columns**

```sql
-- Add missing columns to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS class_level TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS total_marks INTEGER;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS passing_marks INTEGER;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS description TEXT;
```

---

## 2️⃣ **Fix Test Results Table - Add Missing Columns**

```sql
-- Add missing columns to test_results table
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2);
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS max_marks INTEGER;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS test_name TEXT;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS security_report JSONB DEFAULT '{}';
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS score INTEGER;
```

---

## 3️⃣ **Create Study Materials Table**

```sql
-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  class_level TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  view_count INTEGER DEFAULT 0,
  uploaded_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4️⃣ **Create Live Tests Table**

```sql
-- Create live_tests table
CREATE TABLE IF NOT EXISTS live_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5️⃣ **Create Test Participants Table**

```sql
-- Create test_participants table
CREATE TABLE IF NOT EXISTS test_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_test_id UUID REFERENCES live_tests(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'in_progress', 'completed', 'disconnected')),
  current_question INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6️⃣ **Create Student Rankings Table**

```sql
-- Create student_rankings table
CREATE TABLE IF NOT EXISTS student_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_marks INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  rank INTEGER,
  percentile DECIMAL(5,2),
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7️⃣ **Create Material Views Table**

```sql
-- Create material_views table
CREATE TABLE IF NOT EXISTS material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  view_duration INTEGER DEFAULT 0,
  device_info JSONB DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 8️⃣ **Create Test Schedules Table**

```sql
-- Create test_schedules table
CREATE TABLE IF NOT EXISTS test_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  max_participants INTEGER,
  instructions TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 9️⃣ **Create User Profiles Table**

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  name TEXT,
  photon_id TEXT UNIQUE,
  subject TEXT,
  class_level TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔟 **Update Existing Data**

```sql
-- Update percentage column in test_results
UPDATE test_results 
SET percentage = CASE 
    WHEN max_marks > 0 THEN (score::decimal / max_marks::decimal) * 100
    ELSE 0
END
WHERE percentage IS NULL AND score IS NOT NULL AND max_marks IS NOT NULL;

-- Set default values for tests table
UPDATE tests 
SET 
    is_published = COALESCE(is_published, false),
    class_level = COALESCE(class_level, '10'),
    subject = COALESCE(subject, 'General'),
    duration_minutes = COALESCE(duration_minutes, 60)
WHERE 
    is_published IS NULL OR 
    class_level IS NULL OR 
    subject IS NULL OR 
    duration_minutes IS NULL;
```

---

## 1️⃣1️⃣ **Create Helper Functions**

```sql
-- Create helper functions for RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'teacher' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'student' 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 1️⃣2️⃣ **Create Utility Functions**

```sql
-- Create utility functions
CREATE OR REPLACE FUNCTION increment_material_views(material_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials 
  SET view_count = view_count + 1 
  WHERE id = material_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 1️⃣3️⃣ **Create Performance Indexes**

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_published ON tests(is_published);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_class_level ON tests(class_level);

CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_percentage ON test_results(percentage);

CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_class_level ON study_materials(class_level);
CREATE INDEX IF NOT EXISTS idx_study_materials_active ON study_materials(is_active);

CREATE INDEX IF NOT EXISTS idx_live_tests_test_id ON live_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_live_tests_active ON live_tests(is_active);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_photon_id ON user_profiles(photon_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
```

---

## 1️⃣4️⃣ **Create Update Triggers**

```sql
-- Create update triggers for timestamp columns
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON study_materials;
CREATE TRIGGER update_study_materials_updated_at
    BEFORE UPDATE ON study_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_live_tests_updated_at ON live_tests;
CREATE TRIGGER update_live_tests_updated_at
    BEFORE UPDATE ON live_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_schedules_updated_at ON test_schedules;
CREATE TRIGGER update_test_schedules_updated_at
    BEFORE UPDATE ON test_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 1️⃣5️⃣ **Insert Test Teacher Profile**

```sql
-- Insert the test teacher profile
INSERT INTO user_profiles (id, email, role, name, photon_id, subject, department)
SELECT 
  id, 
  email, 
  'teacher', 
  'JP7 Teacher', 
  'jp7', 
  'Physics', 
  'Science'
FROM auth.users 
WHERE email = 'jp7@photon'
ON CONFLICT (id) DO UPDATE SET
  role = 'teacher',
  name = 'JP7 Teacher',
  photon_id = 'jp7',
  subject = 'Physics',
  department = 'Science',
  updated_at = NOW();
```

---

## 1️⃣6️⃣ **Verification Query**

```sql
-- Verify the schema fixes
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'tests', 'test_results', 'study_materials', 'live_tests', 
    'test_participants', 'student_rankings', 'material_views', 
    'test_schedules', 'user_profiles'
)
GROUP BY table_name
ORDER BY table_name;

-- Check test teacher profile
SELECT 
    email,
    role,
    name,
    photon_id,
    subject,
    department
FROM user_profiles 
WHERE email = 'jp7@photon';
```

---

## ✅ **After Running All Commands**

1. **Test the authentication**: `node test-authenticated-api.js`
2. **Test login in browser**: Navigate to `http://localhost:3002/faculty-portal`
3. **Login with**: `jp7@photon` / `jp7@photon`

---

## 🔧 **If You Get Errors**

### "relation already exists"
- This is normal, it means the table was already created
- Continue with the next command

### "column already exists"
- This is normal, it means the column was already added
- Continue with the next command

### "function already exists"
- This is normal, the `CREATE OR REPLACE` will update it
- Continue with the next command

### Foreign key constraint errors
- Make sure you run the commands in order
- The referenced tables must exist before creating foreign keys

---

## 🎉 **Success Indicators**

After running all commands, you should see:
- ✅ All tables created without errors
- ✅ Test teacher profile exists
- ✅ No more "column does not exist" errors in your app
- ✅ Authentication works in browser

The verification query at the end will show you all the tables and confirm everything is set up correctly!