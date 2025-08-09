# Cross-Device Testing Guide

## Quick Start

### Option 1: Use the Batch Script (Windows)
```bash
# Double-click the file or run in terminal
start-cross-device-test.bat
```

### Option 2: Manual Setup
```bash
# Terminal 1 - Teacher Dashboard
npm run dev:teacher

# Terminal 2 - Student Corner  
npm run dev:student
```

## Testing URLs

### Teacher Dashboard (Port 3001)
- Main Dashboard: http://localhost:3001/teacher-dashboard
- Create Test: http://localhost:3001/teacher-dashboard/create-test
- Manage Tests: http://localhost:3001/teacher-dashboard/manage-tests

### Student Corner (Port 3002)
- Main Page: http://localhost:3002/student-corner
- Mock Tests: http://localhost:3002/student-corner/mock-tests
- Take Test: http://localhost:3002/student-corner/mock-tests/take-test

## Cross-Device Testing Workflow

### Step 1: Create a Test (Teacher Device)
1. Open http://localhost:3001/teacher-dashboard/create-test
2. Create a new test with questions
3. Publish the test
4. Note the test ID from the URL or manage tests page

### Step 2: Access Test (Student Device)
1. Open http://localhost:3002/student-corner/mock-tests
2. The published test should appear in the list
3. Click "Take Test" to start the test
4. Complete and submit the test

### Step 3: Verify Real-time Sync
1. Create/modify tests on teacher device
2. Check if changes appear immediately on student device
3. Test cross-device data persistence

## Network Access (For Different Devices)

### Find Your IP Address
```bash
# Windows
ipconfig

# Look for IPv4 Address (e.g., 192.168.1.100)
```

### Access from Other Devices
Replace `localhost` with your IP address:
- Teacher: http://192.168.1.100:3001/teacher-dashboard
- Student: http://192.168.1.100:3002/student-corner

## Testing Checklist

### Teacher Dashboard Tests
- [ ] Create new test
- [ ] Add questions with AI extraction
- [ ] Publish test
- [ ] View test analytics
- [ ] Edit existing tests

### Student Corner Tests
- [ ] View available tests
- [ ] Take a test
- [ ] Submit test
- [ ] View test results
- [ ] Cross-device sync verification

### Real-time Features
- [ ] Test creation appears on student side
- [ ] Test updates sync across devices
- [ ] Student submissions visible to teacher
- [ ] Live test status updates

## Troubleshooting

### Port Already in Use
```bash
# Kill existing processes
taskkill /f /im node.exe

# Or use different ports
npm run dev -- -p 3003
```

### Network Access Issues
1. Check Windows Firewall settings
2. Ensure both devices are on same network
3. Try disabling antivirus temporarily

### Database Sync Issues
1. Check Supabase connection
2. Verify environment variables
3. Check browser console for errors

## Environment Variables

Make sure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

## Performance Tips

1. Use Chrome DevTools Network tab to monitor API calls
2. Check Supabase dashboard for real-time connections
3. Monitor console logs for errors
4. Test with different network conditions

## Common Test Scenarios

### Scenario 1: Basic Flow
1. Teacher creates test → Student takes test → Teacher views results

### Scenario 2: Real-time Updates
1. Teacher publishes test → Student sees it immediately
2. Student submits → Teacher sees submission instantly

### Scenario 3: Multi-device Access
1. Same test accessible from multiple student devices
2. Teacher can monitor from different devices

## Success Indicators

✅ Tests created on teacher device appear on student device
✅ Real-time synchronization works
✅ Cross-device data persistence
✅ No data loss between sessions
✅ Smooth user experience on both sides