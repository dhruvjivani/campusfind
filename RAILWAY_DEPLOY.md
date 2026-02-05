# 🚀 Deploy CampusFind to Railway

Railway is the best platform for your project because it **supports external MySQL databases** without blocking connections.

## Step 1: Sign Up on Railway

1. Go to **https://railway.app**
2. Click **Start Project**
3. Sign up with GitHub (easiest option)
4. Authorize Railway to access your GitHub account

## Step 2: Create New Project

1. Click **New Project** 
2. Select **Deploy from GitHub repo**
3. Search for `campusfind`
4. Select `dhruvjivani/campusfind`
5. Railway will auto-detect it's a Node.js project

## Step 3: Configure Environment Variables

Railway will ask for environment variables:

1. Click **Add Variable**
2. Add these exact variables:

```
DB_HOST = sql.freedb.tech
DB_PORT = 3306
DB_USER = freedb_dhruvjivani
DB_PASSWORD = NzWef2g$*mjjAY?
DB_NAME = freedb_campusfind
JWT_SECRET = secreatkeyforcampusfindapp
JWT_EXPIRE = 7d
NODE_ENV = production
PORT = 5000
MAX_FILE_SIZE = 5000000
UPLOAD_PATH = ./uploads/
```

**Important:** Copy exact values - no quotes needed in Railway!

## Step 4: Deploy

1. Railway automatically deploys when you add variables
2. Wait 2-5 minutes for deployment to complete
3. Watch the **Deployments** tab for status

## Step 5: Get Your Live URL

Once deployed:
1. In Railway dashboard, find your service
2. Go to **Settings**
3. Look for **Public URL** (looks like: `https://campusfind-xxxxx.up.railway.app`)
4. Copy this URL

## Step 6: Test Your API

```bash
# Test health check
curl https://your-railway-url.up.railway.app/

# Test registration
curl -X POST https://your-railway-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "S001",
    "email": "test@conestogac.on.ca",
    "password": "Test123",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Testing"
  }'
```

## Step 7: Update Your Code with Live URL (Optional)

If you want to test against production:

1. Edit `test_api.js` line 4:
```javascript
const API_BASE = 'https://your-railway-url.up.railway.app';
```

2. Run tests:
```bash
node test_api.js
```

## Step 8: Commit the Railway URL

Once confirmed working:
```bash
git add .
git commit -m "Add Railway production URL to documentation"
git push origin main
```

---

## Troubleshooting

### Deployment Failed?
- Check **Deployments** tab in Railway for error logs
- Verify all environment variables are set correctly
- Ensure database credentials match exactly

### Still Getting ECONNREFUSED?
- Railway might take a few minutes to fully initialize
- Wait 5 minutes and try again
- Check Railway logs for connection errors

### Need Help?
- Railway support: https://railway.app/support
- Check your deployment logs for specific errors

---

## Expected Results

✅ Health check returns 200
✅ User registration works
✅ Full CRUD operations work
✅ All 17 tests pass: `node test_api.js`
✅ Production URL is live

---

## Summary

Your CampusFind API is ready:
- ✅ Code is production-ready
- ✅ Tests all pass locally
- ✅ Database credentials configured
- ✅ Just needs deployment to Railway

**Estimated time to go live: 10 minutes** 🎯

---

**Next: Sign up on Railway and follow the steps above!**

Once live, you'll have a working production API at a public URL! 🚀
