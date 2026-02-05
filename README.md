<div align="center">

# 🎓 CampusFind - Lost & Found System

<div>
<img src="https://img.shields.io/badge/Node.js-v14+-green?style=for-the-badge&logo=node.js" alt="Node.js">
<img src="https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express" alt="Express.js">
<img src="https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql" alt="MySQL">
<img src="https://img.shields.io/badge/JWT-Auth-blue?style=for-the-badge" alt="JWT">
</div>

**A comprehensive RESTful API for managing lost and found items on college campuses**

> Students report items, search lost belongings, and submit claims with complete staff verification workflow

[Features](#-features) • [Installation](#-installation--setup) • [API Docs](#-api-endpoints) • [Testing](#-testing) • [License](#-license)

</div>

---

## 🎯 Features

- ✅ **User Authentication** - Secure JWT-based login with .on.ca email verification
- ✅ **Item Management** - Report lost/found items with images, full CRUD operations  
- ✅ **Advanced Search** - Filter by category, campus, status with pagination
- ✅ **Claim Verification** - Submit claims with complete staff review workflow
- ✅ **Role-Based Access** - Student and staff permissions enforced
- ✅ **Image Uploads** - Support for item photos (JPG, PNG, GIF, WebP)
- ✅ **Production Ready** - Database on FreDB.tech, fully tested
- ✅ **Database with Sample Data** - 6 users, 13+ items, 6+ claims

## 🔧 Tech Stack

<table>
<tr>
<td width="50%">

### Backend
- **Runtime:** Node.js v14+
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **Authentication:** JWT
- **Encryption:** Bcryptjs
- **File Upload:** Multer
- **HTTP Client:** Axios

</td>
<td width="50%">

### Frontend
- **Markup:** HTML5
- **Styling:** CSS3
- **Scripts:** Vanilla JavaScript
- **HTTP:** Fetch API
- **Storage:** LocalStorage

</td>
</tr>
</table>

## 📦 Installation & Setup

### Prerequisites

```
✓ Node.js v14+ installed
✓ npm package manager
✓ Port 5000 available (or modify in .env)
✓ Production database already configured (FreDB.tech)
```

### 🚀 Quick Start

```bash
# 1. Navigate to project directory
cd campusfind

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

> Server will be running at **`http://localhost:5000`**

**For development with auto-reload:**
```bash
npm run dev
```

### 📝 Configuration

The `.env` file is **pre-configured for production** (FreDB.tech):

```env
DB_HOST=sql.freedb.tech
DB_USER=freedb_dhruvjivani
DB_PASSWORD=NzWef2g$*mjjAY?
DB_NAME=freedb_campusfind
NODE_ENV=production
```

> ⚠️ Sample data is already loaded in production database

### 🔄 Using Local Development Database (Optional)

```bash
# 1. Edit .env file
# - Uncomment local database section
# - Comment production settings

# 2. Initialize local database
node config/setupDatabase.js

# 3. Start server
npm start
```

## 📁 Project Structure

```
campusfind/
├── 📂 bin/
│   └── www                    # Server entry point configuration
│
├── 📂 config/
│   ├── database.js            # MySQL connection pool setup
│   └── setupDatabase.js       # Table creation & sample data
│
├── 📂 controllers/            # Business logic & request handlers
│   ├── authController.js      # User authentication (register, login)
│   ├── itemController.js      # Item CRUD operations
│   └── claimController.js     # Claim CRUD operations
│
├── 📂 middleware/
│   ├── auth.js                # JWT verification & authorization
│   └── upload.js              # File upload handling (Multer)
│
├── 📂 models/                 # Data access layer
│   ├── User.js                # User database methods
│   ├── Item.js                # Item database methods
│   └── Claim.js               # Claim database methods
│
├── 📂 public/                 # Frontend assets
│   ├── index.html             # Homepage
│   ├── javascripts/           # Client-side scripts
│   └── stylesheets/           # CSS styling
│
├── 📂 routes/                 # API endpoint definitions
│   ├── authRoutes.js          # Auth endpoints
│   ├── itemRoutes.js          # Item endpoints
│   └── claimRoutes.js         # Claim endpoints
│
├── 📂 uploads/                # Uploaded item images
│
├── 📄 server.js               # Express server configuration
├── 📄 app.js                  # Main application entry
├── 📄 test_api.js             # Comprehensive API test suite
├── 📄 package.json            # Project dependencies
├── 📄 .env                    # Environment variables
└── 📄 README.md               # This file
```

## 🔐 API Endpoints

### 🔑 Authentication (2 endpoints)
| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Authenticate user |

### 📦 Items - CRUD Operations (7 endpoints)
| Method | Endpoint | Description | Auth |
|:------:|----------|-------------|------|
| `POST` | `/api/items/found` | Report found item | ✅ |
| `POST` | `/api/items/lost` | Report lost item | ✅ |
| `GET` | `/api/items` | Get all items (filterable) | ❌ |
| `GET` | `/api/items/:id` | Get single item | ❌ |
| `PUT` | `/api/items/:id` | Update item details | ✅ |
| `PUT` | `/api/items/:id/status` | Update status (staff) | 👮 |
| `DELETE` | `/api/items/:id` | Delete item (staff) | 👮 |

### 📋 Claims - CRUD Operations (7 endpoints)
| Method | Endpoint | Description | Auth |
|:------:|----------|-------------|------|
| `POST` | `/api/claims` | Submit claim for item | ✅ |
| `GET` | `/api/claims/:id` | Get single claim | ✅ |
| `GET` | `/api/claims/user/my-claims` | Get user claims | ✅ |
| `GET` | `/api/items/:id/claims` | Get item claims | ✅ |
| `PUT` | `/api/claims/:id` | Update claim | ✅ |
| `PUT` | `/api/claims/:id/verify` | Verify claim (staff) | 👮 |
| `DELETE` | `/api/claims/:id` | Cancel claim | ✅ |

**Legend:** ✅ User Auth Required | 👮 Staff Only | ❌ Public Access

## 🔍 Query Parameters

### Search & Filter Items

```
GET /api/items?category=electronics&campus=Main&status=found&search=phone&limit=10&page=1
```

| Parameter | Values | Example |
|-----------|--------|---------|
| `category` | electronics, textbooks, keys, id_cards, clothing, bags, other | `?category=electronics` |
| `campus` | Main, Waterloo, Cambridge | `?campus=Main` |
| `status` | lost, found, claimed | `?status=lost` |
| `search` | Text search in title/description | `?search=iPhone` |
| `limit` | Items per page (default: 20) | `?limit=10` |
| `page` | Page number (default: 1) | `?page=2` |

**Example:** Get lost electronics from Main campus
```
GET /api/items?category=electronics&status=lost&campus=Main
```

## 💾 Database Schema

### 👤 Users Table
```sql
id (PK) | student_id | email | first_name | last_name | 
campus | program | password (hashed) | is_verified | 
role (student/staff) | created_at | updated_at
```

### 📦 Items Table
```sql
id (PK) | title | category | description | location_found | 
campus | status (lost/found/claimed) | image_url | 
user_id (FK) | created_at | updated_at
```

### 🏷️ Claims Table
```sql
id (PK) | item_id (FK) | claimer_id (FK) | owner_id (FK) | 
status (pending/verified/rejected/completed) | 
verification_notes | created_at | updated_at
```

### Relationships
```
User (1) ──→ (∞) Item (reports)
User (1) ──→ (∞) Claim (submits as claimer)
User (1) ──→ (∞) Claim (receives as owner)
Item (1) ──→ (∞) Claim
```

## 🧪 Testing

Run comprehensive test suite covering all CRUD operations:

```bash
node test_api.js
```

### Test Coverage

```
✅ Authentication (register, login)
✅ Item Operations (create found/lost, read, update, delete)
✅ Claim Management (create, read, update, verify, delete)
✅ Authorization Checks (role-based access)
✅ Status Transitions (workflow validation)
✅ Error Handling (validation, permissions)
```

**Expected Output:** All tests pass with exit code `0`

### Manual API Testing

```bash
# Get all items
curl http://localhost:5000/api/items

# Get items by category
curl "http://localhost:5000/api/items?category=electronics"

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"student_id":"001","email":"user@on.ca","password":"pass123"}'
```

## 📝 Sample Data

Database is pre-populated with:
- **6 Users**: 2 staff members, 4 students
- **13 Items**: Electronics, textbooks, keys, bags, etc.
- **6+ Claims**: Various statuses for testing workflow

## 🔑 Authentication

### JWT Token
```
Issued on:      successful registration/login
Expiration:     7 days
Header Format:  Authorization: Bearer <token>
Used for:       protecting routes requiring authentication
```

### User Roles
| Role | Permissions |
|------|-------------|
| **Student** | Report items, submit claims, update own items |
| **Staff** | Full access, verify claims, manage all items |

### Example: Using Token

```bash
curl -X GET http://localhost:5000/api/claims/user/my-claims \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📤 File Upload

### Configuration
- **Formats:** JPG, PNG, GIF, WebP
- **Max Size:** 5MB
- **Storage:** `./uploads/` directory
- **Validation:** Automatic type & size checking

### Upload Example

```bash
curl -X POST http://localhost:5000/api/items/found \
  -H "Authorization: Bearer <token>" \
  -F "title=Lost iPhone" \
  -F "category=electronics" \
  -F "description=iPhone 13 Pro" \
  -F "location_found=Library" \
  -F "campus=Main" \
  -F "image=@/path/to/image.jpg"
```

### Response
```json
{
  "message": "Found item reported successfully",
  "data": {
    "id": 1,
    "image_url": "/uploads/1707046800000-item.jpg"
  }
}
```

## ⚙️ Environment Variables

### Production Configuration (Current)

```env
# Server
PORT=5000
NODE_ENV=production

# Database (FreDB.tech)
DB_HOST=sql.freedb.tech
DB_USER=freedb_dhruvjivani
DB_PASSWORD=NzWef2g$*mjjAY?
DB_NAME=freedb_campusfind
DB_PORT=3306

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads/
```

### Local Development Configuration (Edit .env to use)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campusfind_db
NODE_ENV=development
```

## 🚨 Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | ✅ OK | Successful GET request |
| `201` | ✅ Created | Item/claim successfully created |
| `400` | ❌ Bad Request | Invalid data format |
| `401` | ❌ Unauthorized | Missing/invalid JWT token |
| `403` | ❌ Forbidden | Insufficient permissions |
| `404` | ❌ Not Found | Resource doesn't exist |
| `500` | ❌ Server Error | Internal server error |

### Response Format

```json
{
  "message": "Descriptive message (error or success)",
  "data": { },
  "error": { }
}
```

### Example Error Response

```json
{
  "message": "Unauthorized",
  "error": {
    "code": "INVALID_TOKEN",
    "details": "JWT token expired or invalid"
  }
}
```

## 🐛 Troubleshooting

| Problem | Solution | Command |
|---------|----------|---------|
| Dependencies missing | Install npm packages | `npm install` |
| Database connection fails | Verify MySQL running, check .env | Check `.env` settings |
| Port 5000 already in use | Kill process or change port | Change `PORT=5000` in `.env` |
| JWT token expired | Re-authenticate user | `/api/auth/login` |
| File upload fails | Check size < 5MB, format valid | Supported: JPG, PNG, GIF, WebP |
| `Cannot find module` | Run npm install again | `npm install` |
| `Error: listen EADDRINUSE` | Another process using port | Use different port in `.env` |

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Test database connection
node config/setupDatabase.js

# View server logs
npm start

# Run with verbose logging
DEBUG=* npm start
```

## 📚 Additional Resources

### Documentation Files

| File | Purpose |
|------|---------|
| [documentation.txt](documentation.txt) | Complete API reference & examples |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Deploy to Render, Heroku, Railway |
| [QUICK_DEPLOY.md](QUICK_DEPLOY.md) | Copy-paste deployment commands |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Full project overview |
| [INDEX.md](INDEX.md) | Documentation navigation |

### Quick Links

- **View All Documentation:** See [INDEX.md](INDEX.md) for navigation
- **API Reference:** Check [documentation.txt](documentation.txt) for detailed endpoints
- **Deploy Now:** Follow [QUICK_DEPLOY.md](QUICK_DEPLOY.md) to launch live

## 🔒 Security Features

```
✓ Password Hashing       → Bcryptjs (10 rounds)
✓ Authentication        → JWT tokens (7-day expiry)
✓ Email Validation      → .on.ca domain enforcement
✓ Role-Based Access     → Student vs Staff permissions
✓ File Validation       → Type & size checking
✓ SQL Injection Safety  → Parameterized queries
✓ Input Validation      → All endpoints validated
✓ Error Handling        → No sensitive data leakage
```

### Best Practices Implemented

- ✅ Passwords never stored in plain text
- ✅ JWT used for stateless authentication
- ✅ Authorization checks on protected routes
- ✅ File uploads validated before storage
- ✅ Database queries use parameterized statements
- ✅ CORS configured for security

## 📋 Project Info

<div align="center">

| Aspect | Details |
|--------|---------|
| **Version** | 1.0.0 |
| **Status** | ✅ Production Ready |
| **Updated** | February 4, 2026 |
| **Testing** | ✅ All CRUD verified |
| **Database** | ✅ FreDB.tech (live) |
| **Endpoints** | 16 API routes |
| **License** | MIT |

</div>

## 📞 Support & Help

1. **Check Error Message** - Review console output for details
2. **Review Examples** - See [test_api.js](test_api.js) for usage patterns
3. **Check .env** - Verify configuration is correct
4. **View Docs** - See [documentation.txt](documentation.txt) for detailed help
5. **Check Logs** - MySQL connection and API errors shown in console

## 🚀 Next Steps

Ready to deploy? Follow these steps:

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CampusFind API"
   git push origin main
   ```

2. **Deploy to Production**
   - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for Render/Heroku/Railway options
   - Or use [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for quick setup

3. **Test Live Application**
   - Verify all endpoints respond correctly
   - Test file uploads and authentication

---

<div align="center">

### 🎓 Happy Campus Finding! 🎓

**Built with ❤️ for college communities**

[⬆ Back to top](#campusfind---lost--found-system)

</div>
#   c a m p u s f i n d 
 
 