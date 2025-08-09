# 🔧 Server Startup Troubleshooting Guide

## ✅ **Port Configuration Fixed**
I've fixed the port mismatch in your `.env.local` file:
- **Before**: NEXTAUTH_URL (port 3000) ≠ REDIRECT_URI (port 9002) ❌
- **After**: Both using port 3000 ✅

## 🚀 **Try Starting the Server Now:**

### **Option 1: Standard Port 3000 (Recommended)**
```bash
npm run dev
```
- Server will start on: http://localhost:3000
- Study materials: http://localhost:3000/student-corner/study-materials

### **Option 2: Use Port 9002 (If Preferred)**
```bash
npm run dev -- -p 9002
```
- Server will start on: http://localhost:9002
- Study materials: http://localhost:9002/student-corner/study-materials

## 🔍 **If Server Still Won't Start:**

### **Common Issues & Solutions:**

#### **1. Port Already in Use**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :9002

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### **2. Node Modules Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### **3. Next.js Cache Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### **4. Environment Variable Issues**
```bash
# Verify environment is loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

#### **5. Permission Issues**
```bash
# Run as administrator (Windows)
# Right-click PowerShell → "Run as Administrator"
npm run dev
```

## 🧪 **Test Server Status:**

### **Quick Test Script:**
```bash
# Test if server responds
curl http://localhost:3000
# or
curl http://localhost:9002
```

### **Test Study Materials API:**
```bash
# Test the API endpoint
curl http://localhost:3000/api/supabase/study-materials
```

## 📋 **Startup Checklist:**

- ✅ Port configuration fixed
- ✅ Environment variables loaded
- ✅ Dependencies installed (`npm install`)
- ✅ No port conflicts
- ✅ Supabase credentials valid
- ✅ Database accessible

## 🎯 **Expected Startup Output:**
```
> npm run dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

## 🚨 **If Nothing Works:**

### **Nuclear Option - Fresh Start:**
```bash
# 1. Stop all Node processes
taskkill /f /im node.exe

# 2. Clear everything
rm -rf node_modules .next
rm package-lock.json

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev
```

### **Alternative Development Server:**
```bash
# Try different port
npm run dev -- -p 3001
npm run dev -- -p 8000
npm run dev -- -p 5000
```

## 📞 **Still Having Issues?**

If the server still won't start, please share:
1. **Error message** from the terminal
2. **Port you're trying to use** (3000 or 9002)
3. **Output of**: `npm run dev`

## 🎉 **Once Server Starts:**

### **Test These URLs:**
- **Home**: http://localhost:3000
- **Student Corner**: http://localhost:3000/student-corner
- **Study Materials**: http://localhost:3000/student-corner/study-materials
- **Teacher Dashboard**: http://localhost:3000/teacher-dashboard

### **Login Credentials:**
- **Teachers**: 
  - `sp8@photon.edu` / `sp8@photon`
  - `mk6@photon.edu` / `mk6@photon`
  - `ak5@photon.edu` / `ak5@photon`

---

**The port configuration has been fixed. Try `npm run dev` now!**