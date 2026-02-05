# ✅ Render Production Setup Guide

## Problem: CRUD Operations Not Working in Production

**Cause:** Render does not automatically read `.env` files from your git repository. You need to manually set environment variables in the Render Dashboard.

## Solution: Configure Environment Variables on Render

### Step 1: Go to Your Render Service Dashboard
1. Visit https://render.com
2. Sign in to your account
3. Navigate to your **campusfind** service/app
4. Go to **Settings** tab

### Step 2: Add Environment Variables

Click on **Environment** section and add the following variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `sql.freedb.tech` |
| `DB_USER` | `freedb_dhruvjivani` |
| `DB_PASSWORD` | `NzWef2g$*mjjAY?` |
| `DB_NAME` | `freedb_campusfind` |
| `DB_PORT` | `3306` |
| `JWT_SECRET` | `secreatkeyforcampusfindapp` |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### Step 3: Redeploy Your Application

After setting environment variables:
1. Go to **Deploys** tab
2. Click **Deploy latest commit**
3. Wait for deployment to complete (usually 2-5 minutes)
4. Check the build logs for any errors

### Step 4: Test the Deployment

Once deployed, test your API:

```bash
# Health check
curl https://campusfind-uuwa.onrender.com/

# Test registration
curl -X POST https://campusfind-uuwa.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "S12345",
    "email": "test@conestogac.on.ca",
    "password": "Test123",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Testing"
  }'
```

## Troubleshooting

### Issue: Still getting 500 errors after setting variables

**Solution:**
1. Check Render logs: Go to **Logs** tab in your service dashboard
2. Look for database connection errors
3. Verify each environment variable is set correctly (case-sensitive!)
4. Manually redeploy after changes

### Issue: "Database connection failed"

**Check:**
- [ ] All DB credentials are exactly correct (copy from .env)
- [ ] FreDB.tech database is online (test at sql.freedb.tech)
- [ ] No typos in DB_HOST, DB_USER, DB_NAME
- [ ] Password special characters are properly escaped

### Issue: Render keeps showing old errors

**Solution:**
1. Go to **Settings** → **Discard all cached data**
2. Then redeploy from **Deploys** tab

## Quick Checklist

- ✅ Environment variables set in Render Dashboard
- ✅ Database connection tested locally (run `node config/setupDatabase.js`)
- ✅ Application redeployed after variable changes
- ✅ Health endpoint responding: `https://campusfind-uuwa.onrender.com/`
- ✅ Auth endpoint working: Try `/api/auth/register`

## Next Steps

Once production is working:
1. Run full test suite: `node test_api.js`
2. Test against production: `ACTUAL_API_BASE=https://campusfind-uuwa.onrender.com node test_api.js`
3. Share live URL with instructor: https://campusfind-uuwa.onrender.com

---

**Need Help?** Check Render logs for detailed error messages!
