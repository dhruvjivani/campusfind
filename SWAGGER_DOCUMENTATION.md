# Swagger/OpenAPI Documentation

## Overview

CampusFind API includes comprehensive Swagger/OpenAPI documentation that provides an interactive interface to explore and test all API endpoints.

## Accessing Swagger Documentation

### Live Swagger UI
Visit the interactive Swagger documentation:
- **Production:** https://campusfind-0463.onrender.com/api-docs
- **Local Dev:** http://localhost:5000/api-docs

### OpenAPI JSON Specification
Access the raw OpenAPI specification:
- **Production:** https://campusfind-0463.onrender.com/swagger.json
- **Local Dev:** http://localhost:5000/swagger.json

## Features

### Interactive API Testing
- Test all endpoints directly from the browser
- Automatically populated request/response examples
- Try-it-out functionality with live API calls
- View response codes and schemas

### Complete Schema Documentation
- All request/response models defined
- Parameter descriptions and types
- Enum values for categorical fields
- Required vs optional fields

### Security Information
- Bearer token authentication
- JWT token handling
- Protected endpoints clearly marked
- Role-based access control documented

### Error Responses
- All possible HTTP status codes listed
- Error message formats documented
- Common error scenarios explained

## Using Swagger UI

### 1. Authentication Flow

1. **Register or Login**
   - Use `POST /api/auth/register` or `POST /api/auth/login`
   - Copy the returned JWT token

2. **Authorize in Swagger**
   - Click the "Authorize" button (padlock icon)
   - Enter: `Bearer <your_token_here>`
   - Click "Authorize"

3. **Test Protected Endpoints**
   - All subsequent requests will include your token
   - Test endpoints that require authentication

### 2. Testing Endpoints

For each endpoint:
1. Click on the endpoint to expand it
2. Click "Try it out"
3. Fill in required parameters
4. Click "Execute"
5. View the response below

### 3. Viewing Schemas

- Click on "Schemas" in Swagger UI
- View complete data models
- See all properties and types
- Check example values

## API Structure

### Authentication Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Items Endpoints
- GET /api/items (with filtering & pagination)
- GET /api/items/{id}
- POST /api/items/found
- POST /api/items/lost
- PUT /api/items/{id}
- PUT /api/items/{id}/status (staff only)
- DELETE /api/items/{id} (staff only)
- GET /api/items/{id}/claims

### Claims Endpoints
- POST /api/claims
- GET /api/claims/{id}
- GET /api/claims/user/my-claims
- PUT /api/claims/{id}
- PUT /api/claims/{id}/verify (staff only)
- DELETE /api/claims/{id}

## Tags Explanation

### Authentication
Endpoints for user registration, login, and profile management

### Items
Endpoints for managing lost and found items, including reporting, searching, and updating

### Claims
Endpoints for managing item claims and verification workflow

## Common Query Parameters

### Items List Filtering
- `category`: electronics, textbooks, keys, id_cards, clothing, bags, other
- `campus`: Main, Waterloo, Cambridge
- `status`: found, lost, claimed
- `search`: Text search in title/description
- `limit`: Items per page (default: 20)
- `page`: Page number (default: 1)

## Security Headers

### Authorization
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Content-Type
Standard endpoints use:
```
Content-Type: application/json
```

File upload endpoints use:
```
Content-Type: multipart/form-data
```

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET/PUT request |
| 201 | Created - Successful POST request |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## Example Workflows

### Complete Item Claim Process

1. **Register User**
   - `POST /api/auth/register`
   - Receive JWT token

2. **Get Available Items**
   - `GET /api/items?status=found`
   - Find an item to claim

3. **View Item Details**
   - `GET /api/items/{id}`
   - Review item description and claims

4. **Submit Claim**
   - `POST /api/claims`
   - Include item_id in request

5. **Track Claim Status**
   - `GET /api/claims/user/my-claims`
   - Monitor verification progress

6. **Staff Verification** (if staff)
   - `PUT /api/claims/{id}/verify`
   - Approve or reject claim

### Report Lost Item Workflow

1. **Report Item**
   - `POST /api/items/lost`
   - Include title, category, location, campus

2. **View Your Items**
   - `GET /api/items?search=<your_item>`
   - Confirm item is listed

3. **Monitor Claims**
   - `GET /api/items/{id}/claims`
   - See who has claimed your item

## Development & Testing

### Local Development
```bash
npm install
npm run dev
```

Visit: http://localhost:5000/api-docs

### Production Testing
Visit: https://campusfind-0463.onrender.com/api-docs

### Import to Tools

#### Postman
1. Download the `CampusFind_API_Postman_Collection.json`
2. Import in Postman
3. Set environment variables
4. Test all endpoints

#### Other Tools
1. Get OpenAPI spec from `/swagger.json`
2. Import into your preferred API tool
3. Use for code generation or testing

## Troubleshooting

### Token Not Working
- Verify token is not expired
- Check token format: `Bearer <token>`
- Re-login if necessary

### 401 Unauthorized
- Ensure you've clicked "Authorize" in Swagger
- Verify token is valid
- Check token hasn't expired

### 403 Forbidden
- Verify user role (staff/student)
- Check if operation requires staff role
- Ensure you own the resource

### 404 Not Found
- Verify resource ID is correct
- Check resource hasn't been deleted
- Ensure endpoint path is correct

## API Versioning

Current API Version: **1.0.0**

The Swagger UI shows the current version and will be updated with new versions as they are released.

## Additional Resources

- **README.md** - Project overview
- **API_DOCUMENTATION.md** - Detailed endpoint documentation
- **DEPLOYMENT.md** - Deployment instructions
- **CampusFind_API_Postman_Collection.json** - Postman collection

## Support

For issues with Swagger documentation or API:
1. Check the API_DOCUMENTATION.md for details
2. Review error messages and status codes
3. Verify your request format matches examples
4. Contact support for technical issues

---

**Last Updated:** January 2025
