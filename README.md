# CampusFind - Lost & Found System API

A comprehensive RESTful API for managing lost and found items on college campuses. Students can report items, search for lost belongings, and submit claims for found items with a complete verification workflow.

## 🎯 Features

- ✅ **User Authentication** - Registration with .on.ca email verification, JWT-based login
- ✅ **Item Management** - Report lost/found items with images, update, and delete functionality
- ✅ **Advanced Search** - Filter by category, campus, status with pagination support
- ✅ **Claim System** - Submit and track claims with staff verification workflow
- ✅ **Role-Based Access** - Student and staff roles with appropriate permissions
- ✅ **Image Uploads** - Support for item photos (JPG, PNG, GIF, WebP)
- ✅ **Full CRUD Operations** - Complete Create, Read, Update, Delete for all resources
- ✅ **Database with Sample Data** - Pre-populated with realistic test data

## 🔧 Tech Stack

**Backend:**

- Node.js v14+
- Express.js (Web Framework)
- MySQL 8.0+ (Database)
- JWT (JSON Web Tokens for authentication)
- Bcryptjs (Password hashing & encryption)
- Multer (File upload handling)
- Axios (HTTP client for testing)

**Frontend:**

- HTML5
- CSS3
- Vanilla JavaScript

## 📦 Installation & Setup

### Prerequisites

- Node.js and npm installed
- Port 5000 available (or configure in .env)
- **Production Database Already Configured** (FreDB.tech)

### Quick Start

1. **Extract project and navigate to directory:**

```bash
cd campusfind
```

2. **Install all dependencies:**

```bash
npm install
```

3. **.env is Pre-configured for Production:**
   The `.env` file is already set up to use the production database on FreDB.tech:

```
DB_HOST=sql.freedb.tech
DB_USER=freedb_dhruvjivani
DB_PASSWORD=NzWef2g$*mjjAY?
DB_NAME=freedb_campusfind
```

4. **Database is Already Initialized:**
   Sample data (users, items, claims) is already loaded in the production database.

5. **Start the server:**

```bash
npm start
```

Server will be running at: `http://localhost:5000`

For development with auto-reload:

```bash
npm run dev
```

### Using Local Development Database (Optional)

To switch to a local MySQL database for development:

1. Uncomment the local database section in `.env`
2. Comment out the production database settings
3. Run: `node config/setupDatabase.js`

## 📁 Project Structure

```
campusfind/
├── bin/
│   └── www                      # Server entry point
├── config/
│   ├── database.js              # Database connection pool
│   └── setupDatabase.js         # DB initialization & sample data
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── itemController.js        # Item CRUD operations
│   └── claimController.js       # Claim CRUD operations
├── middleware/
│   ├── auth.js                  # JWT verification & authorization
│   └── upload.js                # File upload handling
├── models/
│   ├── User.js                  # User model & methods
│   ├── Item.js                  # Item model & methods
│   └── Claim.js                 # Claim model & methods
├── public/
│   ├── index.html               # Frontend homepage
│   ├── javascripts/             # Client-side scripts
│   └── stylesheets/
│       └── style.css            # Styling
├── routes/
│   ├── authRoutes.js            # Authentication endpoints
│   ├── itemRoutes.js            # Item endpoints
│   └── claimRoutes.js           # Claim endpoints
├── uploads/                     # Uploaded item images
├── server.js                    # Main server file
├── test_api.js                  # Comprehensive API tests
├── package.json                 # Project dependencies
├── .env                         # Environment variables
├── README.md                    # This file
└── documentation.txt            # Detailed documentation
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Auth |
| ------ | -------------------- | ----------------- | ---- |
| POST   | `/api/auth/register` | Register new user | No   |
| POST   | `/api/auth/login`    | Login user        | No   |

### Items (CRUD)

| Method | Endpoint                | Description                  | Auth  |
| ------ | ----------------------- | ---------------------------- | ----- |
| POST   | `/api/items/found`      | Report found item            | Yes   |
| POST   | `/api/items/lost`       | Report lost item             | Yes   |
| GET    | `/api/items`            | Get all items (with filters) | No    |
| GET    | `/api/items/:id`        | Get single item              | No    |
| PUT    | `/api/items/:id`        | Update item details          | Yes   |
| PUT    | `/api/items/:id/status` | Update status (staff)        | Staff |
| DELETE | `/api/items/:id`        | Delete item (staff)          | Staff |

### Claims (CRUD)

| Method | Endpoint                     | Description          | Auth  |
| ------ | ---------------------------- | -------------------- | ----- |
| POST   | `/api/claims`                | Submit claim         | Yes   |
| GET    | `/api/claims/:id`            | Get single claim     | Yes   |
| GET    | `/api/claims/user/my-claims` | Get user claims      | Yes   |
| GET    | `/api/items/:id/claims`      | Get item claims      | Yes   |
| PUT    | `/api/claims/:id`            | Update claim         | Yes   |
| PUT    | `/api/claims/:id/verify`     | Verify claim (staff) | Staff |
| DELETE | `/api/claims/:id`            | Delete claim         | Yes   |

## 🔍 Query Parameters (Items)

Get all items with filtering:

```
GET /api/items?category=electronics&campus=Main&status=found&limit=10&page=1
```

**Parameters:**

- `category` - electronics, textbooks, keys, id_cards, clothing, bags, other
- `campus` - Main, Waterloo, Cambridge
- `status` - lost, found, claimed
- `search` - Text search in title/description
- `limit` - Items per page (default: 20)
- `page` - Page number (default: 1)

## 💾 Database Schema

### Users Table

- `id` - Primary key
- `student_id` - Unique student identifier
- `email` - Unique email (must end in .on.ca)
- `first_name`, `last_name` - User name
- `campus` - Campus location
- `program` - Program of study
- `password` - Hashed password (Bcrypt)
- `is_verified` - Email verification status
- `role` - student or staff
- `created_at`, `updated_at` - Timestamps

### Items Table

- `id` - Primary key
- `title` - Item title
- `category` - Item category
- `description` - Item details
- `location_found` - Where item was found/lost
- `campus` - Campus location
- `status` - lost, found, or claimed
- `image_url` - URL to uploaded image
- `user_id` - Foreign key to users
- `created_at`, `updated_at` - Timestamps

### Claims Table

- `id` - Primary key
- `item_id` - Foreign key to items
- `claimer_id` - Foreign key to users (who claimed)
- `owner_id` - Foreign key to users (who reported)
- `status` - pending, verified, rejected, completed
- `verification_notes` - Staff notes
- `created_at`, `updated_at` - Timestamps

## 🧪 Testing

Run comprehensive API tests covering all CRUD operations:

```bash
node test_api.js
```

Tests include:

- ✓ User authentication (register, login)
- ✓ Item operations (create, read, update)
- ✓ Claim management (create, read, update, delete)
- ✓ Authorization checks
- ✓ Status transitions

All tests should pass with exit code 0.

## 📝 Sample Data

Database is pre-populated with:

- **6 Users**: 2 staff members, 4 students
- **13 Items**: Electronics, textbooks, keys, bags, etc.
- **6+ Claims**: Various statuses for testing workflow

## 🔑 Authentication

### JWT Token

- Issued on successful registration/login
- Expires in 7 days
- Must be included in Authorization header for protected routes

### Usage

```
Authorization: Bearer <token>
```

### Roles

- **Student** (default): Can report items, submit claims, update own items
- **Staff**: Full access, can verify claims and manage all items

## 📤 File Upload

**Supported Formats:** JPG, PNG, GIF, WebP
**Max Size:** 5MB
**Storage:** `./uploads/` directory

Upload files when creating items:

```
POST /api/items/found
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "title": "Item Title",
  "category": "electronics",
  "description": "Item description",
  "location_found": "Location",
  "campus": "Main",
  "image": <file>
}
```

## ⚙️ Environment Variables

### Production Configuration (Current)

| Variable      | Value                                 | Purpose                  |
| ------------- | ------------------------------------- | ------------------------ |
| PORT          | 5000                                  | Server port              |
| NODE_ENV      | production                            | Environment mode         |
| DB_HOST       | sql.freedb.tech                       | Production database host |
| DB_USER       | freedb_dhruvjivani                    | Database username        |
| DB_PASSWORD   | NzWef2g$\*mjjAY?                      | Database password        |
| DB_NAME       | freedb_campusfind                     | Production database name |
| DB_PORT       | 3306                                  | Database port            |
| JWT_SECRET    | your_super_secret_jwt_key_change_this | JWT signing key          |
| JWT_EXPIRE    | 7d                                    | Token expiration         |
| MAX_FILE_SIZE | 5000000                               | Max upload size (5MB)    |
| UPLOAD_PATH   | ./uploads/                            | Upload directory         |

### Local Development (Optional - Edit .env to use)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campusfind_db
NODE_ENV=development
```

## 🚨 Error Handling

**Status Codes:**

- `200` - OK (successful request)
- `201` - Created (resource created)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

**Response Format:**

```json
{
  "message": "Error or success message",
  "data": {},
  "error": {}
}
```

## 🐛 Troubleshooting

| Issue                      | Solution                            |
| -------------------------- | ----------------------------------- |
| "Cannot find module"       | Run `npm install`                   |
| Database connection failed | Check MySQL is running, verify .env |
| Port 5000 in use           | Change PORT in .env or kill process |
| JWT token expired          | Login again to get new token        |
| File upload fails          | Check file < 5MB, format supported  |

## 📚 Additional Documentation

For detailed information, see [documentation.txt](documentation.txt) which includes:

- Complete API reference
- Database schema details
- Request/response examples
- Security features
- Future enhancements

## 🔒 Security Features

- ✓ Password hashing with Bcryptjs (10 rounds)
- ✓ JWT-based authentication
- ✓ Email domain verification (.on.ca)
- ✓ Role-based authorization
- ✓ File type & size validation
- ✓ SQL injection protection (parameterized queries)
- ✓ CORS configuration

## 📋 Version & Info

- **Version:** 1.0.0
- **Last Updated:** February 4, 2026
- **Status:** Production Ready
- **Tested:** All CRUD operations verified

## 📞 Support

For issues:

1. Check error messages in console
2. Review test_api.js for usage examples
3. Verify .env configuration
4. Check database connectivity
5. See documentation.txt for detailed help

---

**Happy Campus Finding! 🎓**
#   c a m p u s f i n d 
 
 
