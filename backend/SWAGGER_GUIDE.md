# 📚 Kural API - Swagger Documentation Guide

## 🚀 Quick Start

### Access Swagger UI

Once your backend server is running, you can access the interactive API documentation at:

**Local Development:**
```
http://localhost:5000/api-docs
```

**Production:**
```
https://api.kuralapp.in/api-docs
```

---

## 🔐 Authentication

Most endpoints require JWT authentication. Here's how to authenticate in Swagger UI:

### Step 1: Login
1. Navigate to **Authentication** → **POST /api/v1/auth/login**
2. Click **"Try it out"**
3. Enter credentials:
   ```json
   {
     "mobileNumber": "9876543210",
     "password": "yourpassword"
   }
   ```
4. Click **"Execute"**
5. Copy the `token` from the response

### Step 2: Authorize
1. Click the **🔒 Authorize** button at the top right
2. Paste your token in the format: `Bearer YOUR_TOKEN_HERE`
3. Click **"Authorize"**
4. Click **"Close"**

Now you can test all protected endpoints! ✅

---

## 📖 API Categories

### 🔐 Authentication
- `POST /auth/login` - Login and get JWT token
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user profile
- `PUT /auth/updatepassword` - Update password

### 👥 Voters
- `GET /voters/by-part/{partNumber}` - Get voters by part number
- `POST /voters/search` - Search voters
- `GET /voters/{id}` - Get voter by ID
- `POST /voters` - Create new voter
- `GET /voters/age-range` - Get voters by age range
- `GET /voters/part-names` - Get all part names

### 📊 Surveys
- `GET /survey-forms` - Get all survey forms
- `GET /survey-forms/{id}` - Get survey form by ID
- `POST /survey-forms/{id}/responses` - Submit survey response
- `GET /survey-forms/{id}/completed-voters` - Get completed voters

### 👔 Booths (Staff)
- `GET /booths` - Get all booths
- `POST /booths` - Create new booth
- `POST /booths/login` - Booth login
- `PUT /booths/{id}` - Update booth
- `DELETE /booths/{id}` - Delete booth

### 🗳️ Elections
- `GET /elections` - Get all elections
- `POST /elections` - Create election
- `GET /elections/active` - Get active election

### ⚙️ Settings
- `GET /settings/religions` - Get religions list
- `GET /settings/castes` - Get castes list
- `GET /settings/categories` - Get voter categories
- `GET /settings/parties` - Get political parties
- `GET /settings/schemes` - Get schemes list

### 📱 Special Categories
- `GET /mobile-voters` - Voters with mobile numbers
- `GET /transgender-voters` - Transgender voters
- `GET /fatherless-voters` - Fatherless voters
- `GET /guardian-voters` - Voters with guardians
- `GET /age60above-voters` - Voters aged 60+
- `GET /age80above-voters` - Voters aged 80+

### 🎨 Customization
- `GET /part-colors` - Get part colors
- `POST /part-colors` - Create part color
- `GET /vulnerabilities` - Get vulnerabilities
- `POST /vulnerabilities` - Create vulnerability

### 📦 Catalogue
- `GET /catalogue` - Get all catalogue items
- `POST /catalogue` - Create catalogue item

### 🏥 Health Check
- `GET /health` - Server health status

---

## 💡 Usage Examples

### Example 1: Get Voters by Part Number

**Request:**
```http
GET /api/v1/voters/by-part/119 -001?limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Name": "Rajesh Kumar",
      "Age": "45",
      "Gender": "M",
      "EPIC No": "TND119 0001",
      "Mobile No": "+91 9876543210"
    }
  ]
}
```

### Example 2: Submit Survey Response

**Request:**
```http
POST /api/v1/survey-forms/FORM001/responses
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "formId": "FORM001",
  "respondentVoterId": "TND119 0001",
  "respondentName": "Rajesh Kumar",
  "answers": [
    {
      "questionId": "q1",
      "answer": "option1"
    }
  ],
  "isComplete": true
}
```

### Example 3: Search Voters

**Request:**
```http
POST /api/v1/voters/search
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "Name": "Kumar",
  "partNo": "119 ",
  "limit": 100,
  "page": 1
}
```

---

## 🔧 Testing Tips

### 1. **Use the "Try it out" feature**
   - Click "Try it out" on any endpoint
   - Fill in the required parameters
   - Click "Execute" to see the response

### 2. **Check Response Schemas**
   - Expand the response sections (200, 400, etc.)
   - See the expected data structure
   - Understand error formats

### 3. **Use Query Parameters**
   - Many endpoints support pagination: `?page=1&limit=50`
   - Filter parameters: `?status=active&minAge=60`

### 4. **Handle Errors**
   - 400: Bad Request - Check your input data
   - 401: Unauthorized - Your token expired or is invalid
   - 404: Not Found - Resource doesn't exist
   - 500: Server Error - Backend issue

---

## 🎯 Common Query Parameters

### Pagination
```
?page=1&limit=50
```

### Filtering
```
?status=active
?minAge=60&maxAge=80
?gender=M
```

### Search
```
?q=searchterm
?Name=Kumar
```

### Sorting
```
?sort=age
?sort=-createdAt (descending)
```

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 988,
    "pages": 20
  }
}
```

---

## 🛠️ Advanced Features

### 1. **Bulk Operations**
Some endpoints support bulk operations:
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

### 2. **Field Selection**
Select specific fields:
```
?fields=Name,Age,EPIC No
```

### 3. **Population**
Include related data:
```
?populate=election,booth
```

---

## 📞 Support

If you encounter any issues:
1. Check the console logs in your backend
2. Verify your JWT token is valid
3. Ensure all required fields are provided
4. Check the API response error messages

---

## 🔄 API Versioning

Current API version: **v1**

Base URL structure:
```
/api/v1/{resource}
```

---

## 🚦 Rate Limiting

**Note:** Rate limiting is currently **disabled** for development.

When enabled in production:
- Default: 1000 requests per 15 minutes per IP
- Configurable via environment variables

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🎉 Happy Testing!

Your Swagger UI is now fully configured and ready to use. Explore the interactive documentation to test all API endpoints!

**Remember to:**
- ✅ Always authenticate before testing protected endpoints
- ✅ Check response schemas for data structure
- ✅ Use proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Include required headers (Content-Type, Authorization)

---

*Last Updated: October 29, 2025*
