# CampusFind API Documentation

## Overview

CampusFind is a comprehensive Lost & Found management system API built with Node.js, Express, and PostgreSQL. This RESTful API enables students and staff to report lost/found items, search for items, and manage claim verification workflows.

**Base URL:** `https://campusfind-0463.onrender.com`

**Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [HTTP Status Codes](#http-status-codes)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Items Endpoints](#items-endpoints)
   - [Claims Endpoints](#claims-endpoints)
5. [Data Models](#data-models)
6. [Query Parameters](#query-parameters)
7. [Rate Limiting & Security](#rate-limiting--security)

---

## Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Acquisition

1. Register a new user or login
2. Receive JWT token in response
3. Include token in all subsequent requests

**Token Expiry:** 7 days

---

## HTTP Status Codes

| Code | Meaning | Description |
|:----:|:-------:|:------------|
| **200** | OK | Successful GET, PUT request |
| **201** | Created | Resource successfully created (POST) |
| **400** | Bad Request | Invalid request parameters or data |
| **401** | Unauthorized | Missing or invalid JWT token |
| **403** | Forbidden | Authenticated but insufficient permissions |
| **404** | Not Found | Resource does not exist |
| **500** | Server Error | Internal server error |

---

## Error Handling

### Standard Error Response

```json
{
  "message": "Descriptive error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional context if available"
  }
}
```

### Common Error Messages

- **"User already exists"** - Email is already registered
- **"Invalid credentials"** - Email or password is incorrect
- **"Not authorized"** - Missing JWT token
- **"Not authorized, no token"** - Token not provided
- **"Item not found"** - Item ID doesn't exist
- **"Claim not found"** - Claim ID doesn't exist
- **"Item is already claimed"** - Cannot claim already claimed items
- **"Only pending claims can be cancelled"** - Claim status is not pending

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "student_id": "S12345",
  "email": "student@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Mobile and Web Development",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "student_id": "S12345",
    "email": "student@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Mobile and Web Development",
    "is_verified": true,
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `student_id`: Required, unique
- `email`: Required, must end with `.on.ca`, unique
- `password`: Required, minimum 6 characters
- `first_name`, `last_name`: Required
- `campus`: Required

---

#### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "student@conestogac.on.ca",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "student_id": "S12345",
    "email": "student@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Mobile and Web Development",
    "is_verified": true,
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

#### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Access:** Private (requires JWT token)

**Request Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": 1,
    "student_id": "S12345",
    "email": "student@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Mobile and Web Development",
    "is_verified": true,
    "role": "student"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

### Items Endpoints

#### 1. Get All Items

**Endpoint:** `GET /api/items`

**Access:** Public

**Query Parameters:**
```http
?category=electronics&campus=Main&status=found&search=phone&limit=10&page=1
```

| Parameter | Type | Required | Values |
|-----------|:----:|:--------:|--------|
| `category` | string | No | electronics, textbooks, keys, id_cards, clothing, bags, other |
| `campus` | string | No | Main, Waterloo, Cambridge |
| `status` | string | No | found, lost, claimed |
| `search` | string | No | Text to search in title/description |
| `limit` | number | No | Default: 20, max: 100 |
| `page` | number | No | Default: 1 |

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "id": 1,
      "title": "iPhone 14 Pro",
      "category": "electronics",
      "description": "Found near library entrance",
      "location_found": "Library Building - Main Entrance",
      "campus": "Main",
      "status": "found",
      "image_url": "/uploads/1705123456789.jpg",
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "user_email": "student@conestogac.on.ca",
      "created_at": "2025-01-13T10:30:00Z"
    }
  ]
}
```

---

#### 2. Get Single Item

**Endpoint:** `GET /api/items/:id`

**Access:** Public

**URL Parameters:**
- `id` (required): Item ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "iPhone 14 Pro",
    "category": "electronics",
    "description": "Found near library entrance",
    "location_found": "Library Building - Main Entrance",
    "campus": "Main",
    "status": "found",
    "image_url": "/uploads/1705123456789.jpg",
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "user_email": "student@conestogac.on.ca",
    "created_at": "2025-01-13T10:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Item not found

---

#### 3. Report Found Item

**Endpoint:** `POST /api/items/found`

**Access:** Private (requires JWT token)

**Content-Type:** `multipart/form-data`

**Form Parameters:**
```http
POST /api/items/found HTTP/1.1
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="title"

iPhone 14 Pro
------WebKitFormBoundary
Content-Disposition: form-data; name="category"

electronics
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

Found near library entrance, screen has small crack, has black case
------WebKitFormBoundary
Content-Disposition: form-data; name="location_found"

Library Building - Main Entrance
------WebKitFormBoundary
Content-Disposition: form-data; name="campus"

Main
------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="phone.jpg"
Content-Type: image/jpeg

[binary image data]
------WebKitFormBoundary--
```

**Form Fields:**
| Field | Required | Type | Max Length |
|-------|:--------:|:----:|:----------:|
| `title` | Yes | string | 100 |
| `category` | Yes | string | - |
| `description` | No | string | - |
| `location_found` | Yes | string | 255 |
| `campus` | Yes | string | 50 |
| `image` | No | file | 5MB |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Item reported successfully",
  "data": {
    "id": 15,
    "title": "iPhone 14 Pro",
    "category": "electronics",
    "description": "Found near library entrance",
    "location_found": "Library Building - Main Entrance",
    "campus": "Main",
    "status": "found",
    "image_url": "/uploads/1705123456789.jpg",
    "user_id": 1,
    "created_at": "2025-01-13T10:30:00Z"
  }
}
```

**Validation:**
- Category must be one of the valid options
- Location and campus are required
- Image must be JPG, PNG, GIF, or WebP
- File size must not exceed 5MB

---

#### 4. Report Lost Item

**Endpoint:** `POST /api/items/lost`

**Access:** Private (requires JWT token)

**Content-Type:** `multipart/form-data`

**Form Parameters:**
```json
{
  "title": "Samsung Galaxy Watch 5",
  "category": "electronics",
  "description": "Lost watch with silver band. Serial number on back: SG5-2023-001",
  "location_lost": "Parking Lot B",
  "campus": "Main"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Lost item reported successfully",
  "data": {
    "id": 16,
    "title": "Samsung Galaxy Watch 5",
    "category": "electronics",
    "description": "Lost watch with silver band",
    "location_found": "Parking Lot B",
    "campus": "Main",
    "status": "lost",
    "image_url": null,
    "user_id": 1,
    "created_at": "2025-01-13T11:00:00Z"
  }
}
```

---

#### 5. Update Item

**Endpoint:** `PUT /api/items/:id`

**Access:** Private (Owner or Staff)

**Request Body:**
```json
{
  "title": "Updated iPhone 14 Pro",
  "category": "electronics",
  "description": "Updated description with more details",
  "location_found": "Updated Location",
  "campus": "Main"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "title": "Updated iPhone 14 Pro",
    "category": "electronics",
    "description": "Updated description with more details",
    "location_found": "Updated Location",
    "campus": "Main",
    "status": "found",
    "image_url": "/uploads/1705123456789.jpg",
    "user_id": 1,
    "created_at": "2025-01-13T10:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Item not found
- `403 Forbidden`: Not authorized to update

---

#### 6. Update Item Status

**Endpoint:** `PUT /api/items/:id/status`

**Access:** Private (Staff only)

**Request Body:**
```json
{
  "status": "claimed"
}
```

**Valid Status Values:** `found`, `lost`, `claimed`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item status updated successfully",
  "data": {
    "id": 1,
    "status": "claimed",
    ...
  }
}
```

**Error Responses:**
- `404 Not Found`: Item not found
- `403 Forbidden`: Staff role required

---

#### 7. Delete Item

**Endpoint:** `DELETE /api/items/:id`

**Access:** Private (Staff only)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Item not found
- `403 Forbidden`: Staff role required

---

### Claims Endpoints

#### 1. Create Claim

**Endpoint:** `POST /api/claims`

**Access:** Private (requires JWT token)

**Request Body:**
```json
{
  "item_id": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "data": {
    "id": 5,
    "item_id": 1,
    "claimer_id": 2,
    "owner_id": 1,
    "status": "pending",
    "verification_notes": null,
    "created_at": "2025-01-13T10:45:00Z"
  }
}
```

**Validation:**
- Item must exist and not be already claimed
- User cannot claim their own item

**Error Responses:**
- `404 Not Found`: Item not found
- `400 Bad Request`: Item already claimed

---

#### 2. Get Claim by ID

**Endpoint:** `GET /api/claims/:id`

**Access:** Private (Claimer, Owner, or Staff)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "item_id": 1,
    "item_title": "iPhone 14 Pro",
    "item_description": "Found near library entrance",
    "claimer_id": 2,
    "claimer_first": "Jane",
    "claimer_last": "Smith",
    "owner_id": 1,
    "owner_first": "John",
    "owner_last": "Doe",
    "status": "pending",
    "verification_notes": null,
    "created_at": "2025-01-13T10:45:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Claim not found
- `403 Forbidden`: Not authorized

---

#### 3. Get User's Claims

**Endpoint:** `GET /api/claims/user/my-claims`

**Access:** Private (requires JWT token)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 5,
      "item_id": 1,
      "item_title": "iPhone 14 Pro",
      "item_image": "/uploads/1705123456789.jpg",
      "claimer_id": 2,
      "claimer_first": "Jane",
      "claimer_last": "Smith",
      "owner_id": 1,
      "owner_first": "John",
      "owner_last": "Doe",
      "status": "pending",
      "created_at": "2025-01-13T10:45:00Z"
    }
  ]
}
```

---

#### 4. Get Item's Claims

**Endpoint:** `GET /api/items/:id/claims`

**Access:** Private (requires JWT token)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 5,
      "item_id": 1,
      "claimer_id": 2,
      "claimer_first": "Jane",
      "claimer_last": "Smith",
      "status": "pending",
      "created_at": "2025-01-13T10:45:00Z"
    }
  ]
}
```

---

#### 5. Update Claim

**Endpoint:** `PUT /api/claims/:id`

**Access:** Private (Claimer or Staff)

**Request Body:**
```json
{
  "status": "verified",
  "verification_notes": "User provided proof of ownership"
}
```

**Valid Status Values:** `pending`, `verified`, `rejected`, `completed`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim updated successfully",
  "data": {
    "id": 5,
    "status": "verified",
    "verification_notes": "User provided proof of ownership",
    ...
  }
}
```

**Error Responses:**
- `404 Not Found`: Claim not found
- `403 Forbidden`: Not authorized
- `400 Bad Request`: Invalid status

---

#### 6. Verify Claim (Staff)

**Endpoint:** `PUT /api/claims/:id/verify`

**Access:** Private (Staff only)

**Request Body:**
```json
{
  "status": "verified",
  "verification_notes": "Student verified ownership by providing receipt and matching serial number"
}
```

**Valid Status Values:** `verified`, `rejected`, `completed`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim verification updated successfully",
  "data": {
    "id": 5,
    "status": "verified",
    "verification_notes": "Student verified ownership by providing receipt and matching serial number",
    ...
  }
}
```

**Error Responses:**
- `404 Not Found`: Claim not found
- `403 Forbidden`: Staff role required
- `400 Bad Request`: Invalid status

---

#### 7. Cancel Claim

**Endpoint:** `DELETE /api/claims/:id`

**Access:** Private (Claimer or Staff)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Claim deleted successfully"
}
```

**Validation:**
- Only pending claims can be deleted
- Deleting a claim resets item status to "found"

**Error Responses:**
- `404 Not Found`: Claim not found
- `403 Forbidden`: Not authorized
- `400 Bad Request`: Claim is not pending

---

## Data Models

### User Model

```json
{
  "id": 1,
  "student_id": "S12345",
  "email": "student@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Mobile and Web Development",
  "is_verified": true,
  "role": "student",
  "created_at": "2025-01-13T10:00:00Z",
  "updated_at": "2025-01-13T10:00:00Z"
}
```

**Roles:** `student`, `staff`

---

### Item Model

```json
{
  "id": 1,
  "title": "iPhone 14 Pro",
  "category": "electronics",
  "description": "Found near library entrance",
  "location_found": "Library Building - Main Entrance",
  "campus": "Main",
  "status": "found",
  "image_url": "/uploads/1705123456789.jpg",
  "user_id": 1,
  "created_at": "2025-01-13T10:30:00Z",
  "updated_at": "2025-01-13T10:30:00Z"
}
```

**Categories:** electronics, textbooks, keys, id_cards, clothing, bags, other

**Status:** found, lost, claimed

---

### Claim Model

```json
{
  "id": 5,
  "item_id": 1,
  "claimer_id": 2,
  "owner_id": 1,
  "status": "pending",
  "verification_notes": null,
  "created_at": "2025-01-13T10:45:00Z",
  "updated_at": "2025-01-13T10:45:00Z"
}
```

**Status:** pending, verified, rejected, completed

---

## Rate Limiting & Security

### Security Features

- **Password Hashing:** Bcryptjs with 10 rounds
- **JWT Tokens:** 7-day expiry
- **Email Validation:** .on.ca domain requirement
- **SQL Injection Prevention:** Parameterized queries
- **Role-Based Access Control:** Student and Staff roles
- **File Upload Validation:** Type and size checking

### Best Practices

1. Always use HTTPS in production
2. Store JWT token securely (localStorage or sessionstorage)
3. Include token in every protected request
4. Regenerate token after logout
5. Never share sensitive data in logs
6. Validate all user inputs server-side

---

## Postman Collection

A complete Postman collection is available in `CampusFind_API_Postman_Collection.json`. 

**To use:**
1. Import the collection in Postman
2. Set the `BASE_URL` variable to the API endpoint
3. Set the `TOKEN` variable after login
4. All endpoints are ready to test

---

## Support & Feedback

For issues or questions about the API, please contact the development team or create an issue in the repository.

**Last Updated:** January 2025
