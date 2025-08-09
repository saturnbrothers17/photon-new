# Advanced Faculty & Student System Documentation

## Overview
This document describes the comprehensive advanced system for faculty and students with real-time Supabase integration, security features, and advanced functionality.

## 🎯 Key Features

### Faculty Dashboard Features
- **Real-time Test Management**: Create, manage, and monitor tests with live updates
- **Study Material Upload**: Secure PDF upload with view-only access for students
- **Live Test Monitoring**: Start live tests with real-time participant tracking
- **Advanced Analytics**: Detailed student performance analysis with rankings
- **Security Monitoring**: Track student violations and test integrity

### Student Corner Features
- **Live Test Participation**: Join ongoing tests with secure environment
- **Scheduled Test Viewing**: See upcoming tests scheduled by teachers
- **Secure Material Viewer**: View PDF materials with screenshot protection
- **Performance Analytics**: Detailed analysis of test results and rankings
- **Real-time Updates**: Live updates for test availability and results

## 🔒 Security Features

### Screenshot Protection
- **Context Menu Disabled**: Right-click functionality blocked
- **Keyboard Shortcuts Blocked**: F12, Ctrl+Shift+I, Ctrl+U, etc.
- **Developer Tools Detection**: Automatic window closure on dev tools access
- **Drag & Drop Prevention**: Image and content dragging disabled
- **Text Selection Blocked**: Content selection and copying prevented
- **Focus Loss Detection**: Content blur when window loses focus
- **Mobile Gesture Blocking**: Multi-touch screenshot gestures disabled

### Test Security
- **Fullscreen Mode**: Tests run in mandatory fullscreen
- **Tab Switch Detection**: Violations tracked for switching tabs
- **3-Strike System**: Auto-submission after 3 security violations
- **Real-time Monitoring**: Live tracking of student activities
- **Watermarked Content**: All materials have security watermarks

## 📊 Database Schema

### Core Tables
```sql
-- Tests table
tests (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  class_level TEXT,
  duration_minutes INTEGER,
  questions JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Study Materials table
study_materials (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  class_level TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Live Tests table
live_tests (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Test Results table
test_results (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  student_id TEXT,
  test_name TEXT,
  score INTEGER,
  max_marks INTEGER,
  percentage DECIMAL,
  time_taken INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW(),
  answers JSONB,
  security_report JSONB
)

-- Student Rankings table
student_rankings (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  student_id TEXT,
  score INTEGER,
  percentage DECIMAL,
  rank INTEGER,
  percentile DECIMAL,
  time_taken INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Test Participants table (for live tests)
test_participants (
  id UUID PRIMARY KEY,
  live_test_id UUID REFERENCES live_tests(id),
  student_id TEXT,
  status TEXT DEFAULT 'joined',
  current_question INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
)

-- Material Views table (tracking)
material_views (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES study_materials(id),
  student_id TEXT,
  view_duration INTEGER DEFAULT 0,
  device_info JSONB,
  viewed_at TIMESTAMP DEFAULT NOW()
)
```

## 🚀 API Endpoints

### Faculty Dashboard APIs

#### Study Materials API (`/api/supabase/study-materials`)
```typescript
POST /api/supabase/study-materials
Actions:
- upload: Upload new study material
- get-all: Get all materials (with filters)
- get-by-subject: Get materials by subject
- get-by-id: Get specific material
- delete: Soft delete material
- track-view: Track material views
```

#### Live Tests API (`/api/supabase/live-tests`)
```typescript
POST /api/supabase/live-tests
Actions:
- create: Start new live test
- get-active: Get currently active tests
- get-scheduled: Get scheduled tests
- join-test: Student joins live test
- update-participant: Update participant status
- get-participants: Get test participants
- end-test: End live test
```

#### Rankings API (`/api/supabase/rankings`)
```typescript
POST /api/supabase/rankings
Actions:
- calculate: Calculate test rankings
- get-by-test: Get rankings for specific test
- get-by-student: Get student's rankings
- get-leaderboard: Get overall leaderboard
- get-analytics: Get test analytics
```

#### Test Results API (`/api/supabase/test-results`)
```typescript
POST /api/supabase/test-results
Actions:
- save-result: Save test result
- get-results: Get student results
- get-all-results: Get all results (faculty)
- get-result-by-id: Get specific result
```

### Student Corner APIs

#### Tests API (`/api/supabase/tests`)
```typescript
GET/POST /api/supabase/tests
Actions:
- get-all: Get all available tests
- get-published: Get published tests only
- get-by-id: Get specific test
- create: Create new test (faculty)
- update: Update test (faculty)
```

## 🎨 Component Structure

### Faculty Dashboard Components
```
src/app/teacher-dashboard/
├── page.tsx                    # Main advanced dashboard
├── create-test/page.tsx        # Test creation
├── manage-tests/page.tsx       # Test management
└── components/
    ├── AdvancedTeacherDashboard.tsx
    ├── LiveTestMonitor.tsx
    ├── MaterialUploader.tsx
    └── AnalyticsDashboard.tsx
```

### Student Corner Components
```
src/app/student-corner/
├── page.tsx                    # Main student dashboard
├── live-test/[id]/page.tsx     # Live test interface
├── material-viewer/[id]/page.tsx # Secure material viewer
├── test-analysis/[id]/page.tsx # Test result analysis
└── components/
    ├── LiveTestsSection.tsx
    ├── StudyMaterialsGrid.tsx
    ├── ResultsAnalysis.tsx
    └── SecureTestEnvironment.tsx
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security Configuration
NEXT_PUBLIC_ENABLE_SCREENSHOT_PROTECTION=true
NEXT_PUBLIC_MAX_SECURITY_VIOLATIONS=3
NEXT_PUBLIC_AUTO_SUBMIT_ON_VIOLATION=true
```

### Security Configuration
```typescript
// Security settings in components
const SECURITY_CONFIG = {
  maxViolations: 3,
  autoSubmitOnViolation: true,
  enableScreenshotProtection: true,
  enableFullscreenMode: true,
  trackTabSwitching: true,
  blurOnFocusLoss: true,
  disableDevTools: true,
  preventTextSelection: true,
  disableRightClick: true,
  blockKeyboardShortcuts: true
};
```

## 📱 Mobile Support

### Responsive Design
- **Adaptive Layouts**: All components work on mobile devices
- **Touch Gestures**: Mobile-specific security measures
- **Responsive Tables**: Horizontal scrolling for data tables
- **Mobile Navigation**: Touch-friendly interface elements

### Mobile Security
- **Touch Gesture Blocking**: Multi-touch screenshot prevention
- **Mobile Dev Tools**: Detection of mobile debugging tools
- **Screen Recording**: Prevention of mobile screen recording
- **App Switching**: Detection of app switching on mobile

## 🎯 Usage Instructions

### For Faculty

#### Creating Tests
1. Navigate to Teacher Dashboard
2. Go to "Test Management" tab
3. Click "Create New Test"
4. Fill in test details and questions
5. Publish test when ready

#### Starting Live Tests
1. Go to "Live Tests" tab
2. Select a published test
3. Set start/end times
4. Add instructions for students
5. Click "Start Live Test"

#### Uploading Study Materials
1. Go to "Study Materials" tab
2. Fill in material details
3. Select PDF file (only PDFs allowed)
4. Click "Upload Material"
5. Material becomes available to students

#### Monitoring Results
1. Go to "Real-time Results" tab
2. View live submissions and rankings
3. Export results for analysis
4. Track student performance trends

### For Students

#### Joining Live Tests
1. Go to Student Corner
2. Check "Live Tests" section
3. Click "Join Now" on available test
4. Read instructions carefully
5. Click "Start Live Test"

#### Viewing Study Materials
1. Go to "Study Materials" tab
2. Browse available materials
3. Click "View Material"
4. Material opens in secure viewer
5. No download or screenshot allowed

#### Checking Results
1. Go to "My Results" tab
2. View detailed performance analysis
3. Check rankings and percentiles
4. Review question-wise analysis

## 🔍 Troubleshooting

### Common Issues

#### Test Not Loading
- Check internet connection
- Verify test is published
- Ensure test hasn't expired
- Clear browser cache

#### Security Violations
- Don't switch tabs during test
- Keep test window in focus
- Don't use keyboard shortcuts
- Avoid right-clicking

#### Material Not Viewing
- Ensure PDF is properly uploaded
- Check file size limits
- Verify browser PDF support
- Try refreshing the page

### Error Codes
- `TABLE_NOT_FOUND`: Database tables not set up
- `SECURITY_VIOLATION`: Too many security violations
- `TEST_EXPIRED`: Test time has ended
- `UNAUTHORIZED`: Access denied

## 🚀 Deployment

### Prerequisites
1. Supabase project set up
2. Database tables created
3. Environment variables configured
4. SSL certificate for security

### Deployment Steps
1. Build the application: `npm run build`
2. Deploy to hosting platform
3. Configure environment variables
4. Set up database triggers
5. Test all functionality

### Post-Deployment
1. Test faculty dashboard functionality
2. Verify student corner features
3. Check security measures
4. Monitor real-time updates
5. Set up backup procedures

## 📈 Performance Optimization

### Database Optimization
- **Indexes**: Create indexes on frequently queried columns
- **Connection Pooling**: Use Supabase connection pooling
- **Query Optimization**: Optimize complex queries
- **Caching**: Implement Redis caching for frequent data

### Frontend Optimization
- **Code Splitting**: Lazy load components
- **Image Optimization**: Optimize images and assets
- **Bundle Size**: Minimize JavaScript bundle size
- **CDN**: Use CDN for static assets

## 🔐 Security Best Practices

### Data Protection
- **Encryption**: All sensitive data encrypted
- **Access Control**: Role-based access control
- **Audit Logging**: Track all user actions
- **Data Backup**: Regular automated backups

### Application Security
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Protection**: Sanitize user content
- **CSRF Protection**: Implement CSRF tokens

## 📞 Support

### Documentation
- API documentation available
- Component documentation included
- Database schema documented
- Security guidelines provided

### Contact
- Technical support available
- Bug reports welcome
- Feature requests considered
- Community support forum

---

**Note**: This system provides enterprise-level security and functionality for educational institutions. Regular updates and maintenance are recommended for optimal performance.