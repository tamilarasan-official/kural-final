# API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User Details
**PUT** `/auth/updatedetails`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### Update Password
**PUT** `/auth/updatepassword`

Change current user's password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Forgot Password
**POST** `/auth/forgotpassword`

Request password reset token.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**PUT** `/auth/resetpassword/:resettoken`

Reset password using the token received via email.

**Request Body:**
```json
{
  "password": "new_password"
}
```

### Logout
**GET** `/auth/logout`

Logout current user (clears cookie).

## User Management Endpoints

### Get All Users
**GET** `/users`

Get list of all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "pages": 1,
    "total": 2
  },
  "data": [
    {
      "id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-01-02T00:00:00.000Z"
    }
  ]
}
```

### Get Single User
**GET** `/users/:id`

Get specific user by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Note:** Users can only access their own profile unless they are admin.

### Update User
**PUT** `/users/:id`

Update specific user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin" // Only admins can update roles
}
```

**Note:** Users can only update their own profile unless they are admin.

### Delete User
**DELETE** `/users/:id`

Delete specific user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 423 | Locked - Account locked due to failed attempts |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: May have stricter limits

When rate limit is exceeded, you'll receive:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

## Validation Errors

When request validation fails, you'll receive detailed error messages:

```json
{
  "success": false,
  "error": "Name must be at least 2 characters long"
}
```

## Health Check

### Health Status
**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```