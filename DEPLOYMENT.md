# PathPilot Deployment Guide

## 📦 Overview
PathPilot consists of three separate services that need to be deployed:
- **Client** (Next.js) → Deploy to **Vercel**
- **Server** (Express.js + MongoDB) → Deploy to **Render**
- **AI Service** (Python FastAPI) → Deploy to **Render**

---

## 1️⃣ Deploy Client to Vercel

### Prerequisites
1. Create a [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI: `npm i -g vercel`

### Steps

1. **Navigate to client folder**
   ```bash
   cd client
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://pathpilot-server.onrender.com`)

### Alternative: Deploy via GitHub

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your repository
5. Set root directory to `client`
6. Add environment variables
7. Click "Deploy"

---

## 🖥️ Deploy to Render (Backend Server)

### Prerequisites
1. Create a [Render account](https://render.com/register)
2. Connect your GitHub repository

### Steps

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `pathpilot-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

3. **Environment Variables**
   Add the following in Render dashboard:
   ```
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret_here
   YOUTUBE_API_KEY=your_youtube_api_key
   SERP_API_KEY=your_serp_api_key
   PORT=5000
   NODE_ENV=production
   AI_SERVICE_URL=https://pathpilot-ai.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your service URL (e.g., `https://pathpilot-server.onrender.com`)

---

## 🤖 Deploy to Render (AI Service)

### Steps

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `pathpilot-ai`
   - **Root Directory**: `ai`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

3. **Environment Variables**
   Add the following in Render dashboard:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your service URL (e.g., `https://pathpilot-ai.onrender.com`)

---

## 🔗 Connect All Services

After all three services are deployed:

1. **Update Backend Environment Variable**
   - In Render Server dashboard, update:
     - `AI_SERVICE_URL`: Your AI service URL from Render

2. **Update Frontend Environment Variable**
   - In Vercel dashboard, update:
     - `NEXT_PUBLIC_API_URL`: Your backend server URL from Render
   - Redeploy frontend

3. **Update Backend CORS Settings**
   - In `server/index.js`, update CORS origin to your Vercel URL
   - Or use environment variable: `FRONTEND_URL`

---

## 📝 Post-Deployment Checklist

- [ ] MongoDB Atlas is accessible from Render IPs (whitelist `0.0.0.0/0`)
- [ ] All environment variables are set correctly
- [ ] Frontend can connect to backend (check browser console)
- [ ] Backend can connect to AI service (test roadmap generation)
- [ ] Backend can connect to MongoDB (test user registration)
- [ ] API keys are working (YouTube, SERP, GROQ)

---

## 🐛 Troubleshooting

### Frontend Issues
- **Problem**: API calls failing
- **Solution**: Check `NEXT_PUBLIC_API_URL` is set correctly and includes protocol (`https://`)

### Backend Issues
- **Problem**: MongoDB connection fails
- **Solution**: Whitelist Render IPs in MongoDB Atlas Network Access (use `0.0.0.0/0`)

### AI Service Issues
- **Problem**: Roadmap generation fails
- **Solution**: Check GROQ_API_KEY is valid and has credits

### CORS Errors
- **Problem**: Cross-origin requests blocked
- **Solution**: Update CORS settings in `server/index.js` to include your Vercel URL

---

## 🔄 Automatic Deployments

Both Vercel and Render support automatic deployments:

1. **Vercel**: Automatically deploys on push to `main` branch
2. **Render**: Enable "Auto-Deploy" in service settings for automatic deployments on push

---

## 💡 Tips & Troubleshooting

### Free Tier Limitations
- Render free tier services **sleep after 15 minutes** of inactivity
- First request after sleep may take **30-60 seconds** (cold start)
- Consider upgrading to paid tier ($7/month per service) for production

### Common Issues

#### CORS Errors
- Ensure server CORS allows your Vercel domain
- Check `server/index.js` CORS configuration includes your Vercel URL

#### Database Connection Failures
- Verify MongoDB Atlas **Network Access** allows `0.0.0.0/0`
- Check connection string format and credentials
- Ensure database user has read/write permissions

#### Build Failures
- Check build logs in Vercel/Render dashboard
- Verify all dependencies are in `package.json`/`requirements.txt`
- Ensure Node/Python versions match deployment environment

#### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render backend URL
- Check that API keys (GROQ, YouTube, SERP) are valid
- Test endpoints individually using Postman or curl

### Security Best Practices
- **Never commit `.env` files** to GitHub
- Use strong JWT secrets (32+ characters)
- Rotate API keys regularly
- Enable 2FA on deployment platforms

### Monitoring
- **Render Logs**: Service → Logs tab (check for backend errors)
- **Vercel Logs**: Deployments → Click deployment → Logs
- **Browser DevTools**: Network tab to debug API calls
- Set up uptime monitoring (e.g., UptimeRobot) for production

---

## 📊 Cost Estimate

### Free Tier (Development)
| Service | Cost | Limitations |
|---------|------|-------------|
| Vercel | Free | 100GB bandwidth/month |
| Render (Backend) | Free | 750 hours/month, sleeps after 15min |
| Render (AI) | Free | 750 hours/month, sleeps after 15min |
| MongoDB Atlas | Free | 512MB storage |
| **Total** | **$0/month** | Cold starts, limited resources |

### Paid Tier (Production)
| Service | Cost | Benefits |
|---------|------|----------|
| Vercel Pro | $20/month | Unlimited bandwidth, analytics |
| Render Starter (Backend) | $7/month | No sleep, faster CPU |
| Render Starter (AI) | $7/month | No sleep, faster CPU |
| MongoDB Atlas | $9/month | 2GB storage, backups |
| **Total** | **~$43/month** | No cold starts, better performance |

---

## ✅ Pre-Launch Checklist

Before going live:
- [ ] All environment variables configured correctly
- [ ] MongoDB Atlas accessible from Render (0.0.0.0/0 whitelisted)
- [ ] CORS configured with production Vercel domain
- [ ] All API keys valid and have sufficient quota
- [ ] Test user registration and login flow
- [ ] Test AI roadmap generation
- [ ] Test course creation and activity logging
- [ ] Test habit tracking and analytics
- [ ] Verify badge system works
- [ ] Check mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Verify all images load correctly
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure custom domain (optional)

---

## 🎉 You're Live!

Your PathPilot application is now deployed:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://pathpilot-server.onrender.com`
- **AI Service**: `https://pathpilot-ai.onrender.com`

### Next Steps
1. Share your app with users
2. Monitor logs for errors
3. Collect user feedback
4. Plan feature updates
5. Consider upgrading to paid tiers for production

Happy deploying! 🚀
