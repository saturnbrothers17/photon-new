# Authentication Test Guide

## 🎯 Overview
This guide explains how to test the authenticated Supabase system with the jp7@photon teacher account.

## 🔐 Test Credentials
- **Email**: `jp7@photon`
- **Password**: `jp7@photon`
- **Role**: Teacher
- **User ID**: `cb13a4f2-10ce-4c08-b436-a750373e63d6`

## 🚀 Quick Test Steps

### 1. Start the Development Server
```bash
npm run dev
```
The server should start on `http://localhost:3002`

### 2. Access Faculty Portal
Navigate to: `http://localhost:3002/faculty-portal`

### 3. Login with Test Credentials
- Enter `jp7@photon` in the Photon ID field
- Enter `jp7@photon` in the password field
- Click "Access Dashboard"

### 4. Verify Authentication
After successful login, you should be redirected to `/teacher-dashboard` with:
- User session active
- Teacher role permissions
- Access to all teacher features

## 🧪 Automated Tests

### Run Authentication Test
```bash
node test-authenticated-api.js
```

This test verifies:
- ✅ User login/logout
- ✅ Session management
- ✅ User metadata retrieval
- ✅ Database access permissions

### Run User Profile Test
```bash
node create-user-profile.js
```

This ensures the user profile is properly configured.

## 🔧 System Architecture

### Authentication Flow
1. **Frontend Login** → Faculty Portal (`/faculty-portal`)
2. **Supabase Auth** → User authentication with email/password
3. **Session Creation** → JWT token with user metadata
4. **Role-based Access** → Teacher permissions activated
5. **Dashboard Access** → Redirect to `/teacher-dashboard`

### Database Integration
- **User Metadata**: Stored in `auth.users.user_metadata`
- **User Profiles**: Extended data in `user_profiles` table (optional)
- **Row Level Security**: Automatic filtering based on user role
- **API Authentication**: All API routes check user session

## 📊 Features Available to jp7@photon

### Teacher Dashboard Features
- ✅ **Test Management**: Create, edit, publish tests
- ✅ **Study Materials**: Upload PDF materials for students
- ✅ **Live Tests**: Start real-time test sessions
- ✅ **Results Analytics**: View student performance and rankings
- ✅ **Real-time Monitoring**: Live updates of student activities

### API Endpoints (Authenticated)
- `/api/auth/user` - Get current user profile
- `/api/supabase/tests` - Test management (teacher access)
- `/api/supabase/test-results` - Results management (teacher sees all)
- `/api/supabase/study-materials` - Material management (teacher upload)
- `/api/supabase/live-tests` - Live test management (teacher control)
- `/api/supabase/rankings` - Student rankings (teacher analytics)

## 🛡️ Security Features

### Row Level Security (RLS)
- **Teachers**: Can access all data for management
- **Students**: Can only access their own data
- **Automatic Filtering**: Database enforces access rules

### Session Security
- **JWT Tokens**: Secure session management
- **Auto Refresh**: Tokens refresh automatically
- **Secure Storage**: Sessions stored securely in browser

### API Security
- **Authentication Required**: All API routes check user session
- **Role-based Access**: Different permissions for teachers/students
- **Error Handling**: Proper error responses for unauthorized access

## 🔍 Troubleshooting

### Login Issues
1. **Check Credentials**: Ensure `jp7@photon` / `jp7@photon`
2. **Run Setup**: Execute `node setup-test-teacher.js` if user doesn't exist
3. **Check Console**: Look for authentication errors in browser console
4. **Verify Environment**: Ensure `.env.local` has correct Supabase keys

### Database Access Issues
1. **Check RLS**: Some operations may be restricted by Row Level Security
2. **Verify Tables**: Ensure required tables exist in Supabase
3. **Check Permissions**: User may need specific role permissions
4. **Review Logs**: Check server logs for database errors

### API Issues
1. **Authentication Headers**: Ensure API calls include auth headers
2. **Session Expiry**: Check if session has expired
3. **CORS Issues**: Verify CORS settings for API calls
4. **Network Issues**: Check if server is running and accessible

## 📝 Test Scenarios

### Scenario 1: Basic Authentication
1. Navigate to `/faculty-portal`
2. Login with jp7@photon credentials
3. Verify redirect to `/teacher-dashboard`
4. Check user data in dashboard

### Scenario 2: API Access
1. Login as jp7@photon
2. Navigate to teacher dashboard
3. Try creating a test
4. Verify API calls work with authentication

### Scenario 3: Session Persistence
1. Login as jp7@photon
2. Refresh the page
3. Verify user stays logged in
4. Check session data persistence

### Scenario 4: Role-based Access
1. Login as jp7@photon (teacher)
2. Access teacher-only features
3. Verify appropriate permissions
4. Check data filtering works

## 🎉 Success Indicators

### ✅ Authentication Working
- Login redirects to dashboard
- User data displays correctly
- Session persists across page refreshes
- Logout works properly

### ✅ Database Integration Working
- API calls return data
- User role affects data access
- CRUD operations work
- Real-time updates function

### ✅ Security Working
- Unauthorized access blocked
- Role-based permissions enforced
- Sessions expire appropriately
- Error handling works

## 🚀 Next Steps

After successful authentication testing:

1. **Test Student Login**: Create student account and test student features
2. **Test Cross-Device**: Verify authentication works across devices
3. **Test Real-time Features**: Check live updates and synchronization
4. **Performance Testing**: Test with multiple concurrent users
5. **Security Testing**: Verify all security measures work correctly

## 📞 Support

If you encounter issues:
1. Check the console logs for errors
2. Verify environment variables are set
3. Ensure Supabase project is properly configured
4. Run the automated tests to identify issues
5. Review the authentication flow step by step

---

**Ready to test!** 🚀

Navigate to `http://localhost:3002/faculty-portal` and login with:
- **Email**: jp7@photon
- **Password**: jp7@photon