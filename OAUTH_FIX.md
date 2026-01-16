# Google OAuth Configuration - Quick Fix

## Problem
- Getting 401 Unauthorized errors after OAuth login
- Dashboard trying to load before token is stored
- Redirect URL was set to server instead of Next.js app

## Solution

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, make sure you have:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   **NOT** `http://localhost:5000/...`

6. **IMPORTANT**: Leave "Authorized JavaScript origins" empty or add:
   ```
   http://localhost:3000
   ```
   **NOT** the server URL (5000)

7. Click **Save**

### 2. Restart Your Development Server

After updating the redirect URI in Google Console:

1. Stop the Next.js dev server (Ctrl+C in terminal)
2. Restart it:
   ```bash
   cd client
   npm run dev
   ```

### 3. Test OAuth Flow

1. Go to `http://localhost:3000/login`
2. Click "Google" button
3. Select your Google account
4. You should be redirected to dashboard with proper authentication

## What Was Fixed in Code

✅ Increased delay to ensure session is properly set (1 second)
✅ Added error handling for session API call
✅ Changed `router.push()` to `window.location.href` for hard redirect
✅ Added extra delay after storing token to ensure localStorage is updated
✅ Better error messages and console logging

## Still Having Issues?

Check browser console for:
1. "OAuth result:" - Should show `ok: true`
2. "Session response status:" - Should be 200
3. "Token stored in localStorage" - Confirms token is saved
4. "Session data:" - Should show your user info and token

If you see any errors, share the console output!
