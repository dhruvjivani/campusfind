# CampusFind Deployment Guide

## Overview

This guide explains how to deploy the CampusFind API to production using Render and set up PostgreSQL database hosting.

## Prerequisites

- Node.js v14+ installed
- npm package manager
- Git repository (already set up)
- Render account (https://render.com)
- PostgreSQL database (hosted via Render or similar service)

## Current Deployment

**Live URL:** https://campusfind-0463.onrender.com

**Database:** PostgreSQL on Render (configured in .env)

**Test the API:**
```bash
curl https://campusfind-0463.onrender.com/api/items
```

## Deployment Steps

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git status

# Create/switch to main branch for production
git checkout main

# Verify commits are pushed
git log --oneline -5
```

### Step 2: Deploy to Render

1. **Sign up/Login to Render**
   - Visit https://render.com
   - Create a new account or sign in

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the CampusFind repository

3. **Configure Service**
   - **Name:** campusfind
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Production
   - **Plan:** Free tier available

4. **Set Environment Variables**
   - Click "Environment"
   - Add the following:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=secreatkeyforcampusfindapp
   JWT_EXPIRE=7d
   DB_HOST=<your_postgres_host>
   DB_PORT=5432
   DB_USER=<your_db_user>
   DB_PASSWORD=<your_db_password>
   DB_NAME=<your_db_name>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main branch

### Step 3: Database Setup

#### Option A: PostgreSQL on Render (Recommended)

1. Create PostgreSQL database on Render:
   - Click "New +" → "PostgreSQL"
   - Follow setup wizard
   - Copy connection details to .env

2. Initialize database schema:
   ```bash
   # After deployment, visit the Render console
   # The setupDatabase.js will run automatically on first deployment
   # Or manually run:
   curl -X POST https://campusfind-0463.onrender.com/api/health/setup
   ```

#### Option B: FreDB.tech

1. Sign up at FreDB.tech
2. Create MySQL database
3. Update .env with credentials:
   ```env
   DB_HOST=sql.freedb.tech
   DB_USER=freedb_username
   DB_PASSWORD=your_password
   DB_NAME=freedb_dbname
   ```

### Step 4: Initialize Database

Once deployed, initialize the database schema:

```bash
# On your local machine (during development)
node config/setupDatabase.js

# This creates:
# - users table
# - items table
# - claims table
# - sample data for testing
```

Or make a request to set up via cURL:
```bash
curl https://campusfind-0463.onrender.com/
```

## Continuous Deployment (CI/CD)

### GitHub to Render Auto-Deploy

1. **Connect Repository**
   - Render automatically detects GitHub pushes
   - Each commit to `main` branch triggers deployment

2. **Deployment Status**
   - View logs in Render dashboard
   - Check deployment history
   - Rollback if needed

3. **Best Practices**
   - Commit frequently with descriptive messages
   - Test locally before pushing
   - Use branches for new features
   - Merge to main when ready

### Manual Deployment

To manually trigger deployment without code changes:
1. Go to Render dashboard
2. Click on your service
3. Click "Manual Deploy" → "Latest Commit"

## Monitoring & Logs

### View Logs

**In Render:**
1. Select your service
2. Click "Logs" tab
3. Real-time log streaming

**Local Testing:**
```bash
npm run dev
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env |
| Database connection failed | Verify DB credentials in .env |
| Module not found | Run `npm install` |
| CORS errors | Check CORS middleware in server.js |
| JWT errors | Verify JWT_SECRET matches |

## Database Backup & Management

### PostgreSQL Backups

1. **Automatic Backups**
   - Render PostgreSQL includes daily backups
   - Accessible via Render dashboard

2. **Manual Backup**
   ```bash
   pg_dump -U username -d database_name > backup.sql
   ```

3. **Restore from Backup**
   ```bash
   psql -U username -d database_name < backup.sql
   ```

## Environment Variables Reference

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DB_HOST=dpg-xxxxx.postgres.render.com
DB_PORT=5432
DB_USER=campusfind_db_user
DB_PASSWORD=your_secure_password
DB_NAME=campusfind_db

# Authentication
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads/
API_URL=https://campusfind-0463.onrender.com
```

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment variables, not hardcoded values
- [ ] Enable HTTPS (automatic on Render)
- [ ] Validate all user inputs server-side
- [ ] Use parameterized SQL queries (already implemented)
- [ ] Hash passwords with bcrypt (already implemented)
- [ ] Configure CORS properly
- [ ] Set proper database permissions
- [ ] Regular security updates for dependencies

## API Health Check

Test if API is running:

```bash
# Health check
curl https://campusfind-0463.onrender.com/

# Get all items
curl https://campusfind-0463.onrender.com/api/items

# Get API status
curl -s https://campusfind-0463.onrender.com/ | jq .
```

## Scaling & Performance

### Optimization Tips

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_items_status ON items(status);
   CREATE INDEX idx_items_campus ON items(campus);
   CREATE INDEX idx_claims_status ON claims(status);
   ```

2. **Caching**
   - Implement Redis for session caching
   - Cache frequently accessed data

3. **Load Balancing**
   - Render automatically scales
   - Upgrade plan for more capacity

4. **Database Optimization**
   - Regular VACUUM and ANALYZE
   - Monitor slow queries

## Troubleshooting Deployment

### Application won't start

```bash
# Check logs for errors
# Verify PORT environment variable
# Check all dependencies installed
npm install
```

### Database connection issues

```bash
# Test connection from terminal
psql -h host -U user -d database

# Verify credentials in .env
# Check database is running
# Verify firewall rules
```

### Slow API responses

```bash
# Monitor server logs
# Check database indexes
# Profile slow queries
# Consider caching strategies
```

## Rollback Procedure

If deployment fails:

1. **Using Render Dashboard**
   - Go to your service
   - Click "Deployments"
   - Select previous working version
   - Click "Redeploy"

2. **Using Git**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   # Render will auto-deploy the reverted version
   ```

## Post-Deployment

1. **Test All Endpoints**
   - Use Postman collection
   - Test authentication flow
   - Verify CRUD operations

2. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Watch resource usage

3. **Set Up Monitoring**
   - Enable error alerts
   - Set up uptime monitoring
   - Configure log rotation

## Support

For deployment issues:
- Check Render documentation: https://render.com/docs
- Review server logs
- Test locally before deploying
- Verify environment variables

---

**Last Updated:** January 2025
