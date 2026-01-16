# OAuth Setup Guide

## 1. Install Dependencies

Run this command in the `client` folder:
```bash
npm install next-auth
```

Run this command in the `server` folder (if not already installed):
```bash
npm install jsonwebtoken
```

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. Application type: "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret
9. Add to `client/.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

## 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: PathPilot
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it
7. Add to `client/.env.local`:
   ```
   GITHUB_CLIENT_ID=your-actual-client-id
   GITHUB_CLIENT_SECRET=your-actual-client-secret
   ```

## 4. Generate NextAuth Secret

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or in PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Add the generated value to `client/.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret-here
```

## 5. Environment Variables Summary

Your `client/.env.local` should look like:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 6. Start the Application

After setting up all environment variables:

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Visit `http://localhost:3000/login` or `http://localhost:3000/register`

## Features Implemented

✅ Google OAuth login/signup
✅ GitHub OAuth login/signup
✅ Automatic user creation in backend
✅ JWT token generation for OAuth users
✅ Seamless integration with existing authentication
✅ Backend API endpoint `/api/users/oauth` for OAuth handling
✅ User model extended with OAuth provider fields

## How It Works

1. User clicks "Google" or "GitHub" button
2. NextAuth redirects to provider's OAuth page
3. User authorizes the application
4. Provider redirects back with user info
5. Backend creates/updates user and generates JWT token
6. Token stored in localStorage
7. User redirected to dashboard

## Production Setup

For production, update:
- `NEXTAUTH_URL` to your production domain
- OAuth redirect URIs in Google/GitHub settings
- Add production URLs to authorized origins
