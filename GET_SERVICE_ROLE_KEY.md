# 🔑 Get Service Role Key for New Project

## You need to get the Service Role Key from your new Supabase project

### Steps:
1. **Go to your new Supabase project dashboard**:
   - URL: https://qlzxzpibxqsynmnjjvne.supabase.co

2. **Navigate to Settings**:
   - Click **Settings** in the left sidebar
   - Click **API** tab

3. **Copy the Service Role Key**:
   - Look for **"service_role"** section
   - Copy the **secret** key (starts with `eyJ...`)
   - ⚠️ **This is different from the anon/public key you already have**

4. **The Service Role Key should look like**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsenh6cGlieHFzeW5tbmpqdm5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcxODI1NywiZXhwIjoyMDcwMjk0MjU3fQ.DIFFERENT_SIGNATURE_HERE
   ```

## Once you have it, tell me and I'll update your .env.local file!

**Current Status:**
- ✅ Project URL: `https://qlzxzpibxqsynmnjjvne.supabase.co`
- ✅ Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsenh6cGlieHFzeW5tbmpqdm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTgyNTcsImV4cCI6MjA3MDI5NDI1N30.ZJBdh1JSLnW9G4rVihxSDYGSYAVcMWh3i94UwYDGNbI`
- ❌ Service Role Key: **NEEDED**