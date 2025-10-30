# Kural API Documentation

**Base URL:** `http://192.168.10.137:5000/api/v1`  
**Version:** 1.0.0  
**Environment:** Development

---

## Table of Contents

1. [Authentication](#authentication)
2. [Voters Management](#voters-management)
3. [Special Voter Categories](#special-voter-categories)
4. [Elections Management](#elections-management)
5. [Cadre Management](#cadre-management)
6. [Surveys Management](#surveys-management)
7. [Profile Management](#profile-management)
8. [Settings Management](#settings-management)
9. [Catalogue Management](#catalogue-management)
10. [Modal Content](#modal-content)
11. [Vulnerabilities](#vulnerabilities)
12. [Part Colors](#part-colors)

---

## Authentication

### Base Path: `/api/v1/auth`

#### 1. Login
**POST** `/api/v1/auth/login`

Login with mobile number and password.

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6543210abcdef",
    "firstName": "John",
    "lastName": "Doe",
    "mobileNumber": "9876543210",
    "role": "booth_agent",
    "boothAllocation": "119 ",
    "activeElection": "Thondamuthur"
  }
}
```

#### 2. Register
**POST** `/api/v1/auth/register`

Register a new user/cadre.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "9876543210",
  "password": "password123",
  "role": "booth_agent"
}
```

---

## Voters Management

### Base Path: `/api/v1/voters`

#### 1. Create Voter ✨ NEW
**POST** `/api/v1/voters`

Create a new voter in the system.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "voterId": "TND119 0007",
  "fullName": "John Doe",
  "age": "35",
  "gender": "Male",
  "phoneNumber": "+91 9876543210",
  "address": "123 Main Street, Locality",
  "familyId": "F001",
  "specialCategories": ["Age 60+"],
  "partNumber": "119 "
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "sr": 1234,
    "Name": "John Doe",
    "Number": "TND119 0007",
    "sex": "Male",
    "age": 35,
    "Part_no": 119 ,
    "Mobile No": "+91 9876543210",
    "address": "123 Main Street, Locality",
    "familyId": "F001",
    "specialCategories": ["Age 60+"],
    "createdAt": "2025-10-28T10:30:00.000Z"
  },
  "message": "Voter created successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing required fields)
- `400` - Voter with this ID already exists
- `500` - Server error

#### 2. Search Voters
**POST** `/api/v1/voters/search`

Advanced search for voters with multiple parameters.

**Request Body:**
```json
{
  "Name": "John",
  "mobileNo": "9876543210",
  "Number": "TND119 0007",
  "age": "35",
  "partNo": "119 ",
  "serialNo": "123",
  "Father Name": "Doe Sr",
  "page": 1,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "Name": "John Doe",
      "Number": "TND119 0007",
      "age": 35,
      "sex": "Male",
      "Part_no": 119 ,
      "Mobile No": "9876543210"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 45,
    "hasNext": true,
    "hasPrev": false,
    "limit": 10
  },
  "message": "Found 45 voters matching your search criteria"
}
```

#### 3. Get Voter by ID
**GET** `/api/v1/voters/:id`

Get detailed information about a specific voter.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "Name": "John Doe",
    "Number": "TND119 0007",
    "age": 35,
    "sex": "Male",
    "Part_no": 119 ,
    "Mobile No": "9876543210",
    "Father Name": "Doe Sr",
    "Address-House no": "123",
    "Address-Street": "Main Street"
  }
}
```

#### 4. Get Voters by Part Number
**GET** `/api/v1/voters/by-part/:partNumber?page=1&limit=50`

Get all voters in a specific booth/part.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "voters": [
    {
      "_id": "6543210abcdef",
      "Name": "John Doe",
      "Number": "TND119 0007",
      "age": 35,
      "Part_no": 119 
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 500
  }
}
```

#### 5. Get Part Names
**GET** `/api/v1/voters/part-names`

Get list of all unique part numbers with names.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "partNumber": 119 ,
      "partName": "Booth 119 ",
      "partNameTamil": "பூத் 119 "
    }
  ],
  "count": 150
}
```

#### 6. Get Voter Statistics
**GET** `/api/v1/voters/stats/:partNumber`

Get gender statistics for a specific part.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 500,
    "male": 250,
    "female": 245,
    "other": 5
  }
}
```

#### 7. Get Voters by Age Range
**GET** `/api/v1/voters/age-range?minAge=60&maxAge=120&page=1&limit=100`

Get voters within a specific age range.

**Response:**
```json
{
  "success": true,
  "voters": [
    {
      "_id": "6543210abcdef",
      "Name": "Senior Citizen",
      "age": 65,
      "Part_no": 119 
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 1
}
```

---

## Special Voter Categories

### 1. Transgender Voters

**Base Path:** `/api/v1/transgender-voters`

**GET** `/api/v1/transgender-voters?q=search&page=1&limit=10`

Get list of transgender voters.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "Name": "Voter Name",
      "Part_no": 119 ,
      "age": 30
    }
  ]
}
```

### 2. Fatherless Voters

**Base Path:** `/api/v1/fatherless-voters`

**GET** `/api/v1/fatherless-voters?q=search&page=1&limit=10`

### 3. Guardian Voters

**Base Path:** `/api/v1/guardian-voters`

**GET** `/api/v1/guardian-voters?q=search&page=1&limit=10`

### 4. Mobile Voters

**Base Path:** `/api/v1/mobile-voters`

**GET** `/api/v1/mobile-voters?q=search&page=1&limit=10`

### 5. Age 80+ Voters

**Base Path:** `/api/v1/age80above-voters`

**GET** `/api/v1/age80above-voters?q=search&page=1&limit=10`

### 6. Age 60+ Voters

**Base Path:** `/api/v1/age60above-voters`

**GET** `/api/v1/age60above-voters?q=search&page=1&limit=10`

### 7. Soon Voters (18-21 years)

**Base Path:** `/api/v1/soon-voters`

**GET** `/api/v1/soon-voters?q=search&page=1&limit=10`

---

## Elections Management

### Base Path: `/api/v1/elections`

#### 1. Get All Elections
**GET** `/api/v1/elections`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "electionName": "General Election 2025",
      "electionDate": "2025-11-15",
      "status": "active",
      "constituencies": [
        {
          "name": "Thondamuthur",
          "booths": ["119 ", "119", "120"]
        }
      ]
    }
  ]
}
```

#### 2. Create Election
**POST** `/api/v1/elections`

**Request Body:**
```json
{
  "electionName": "General Election 2025",
  "electionDate": "2025-11-15",
  "status": "active"
}
```

#### 3. Update Election
**PUT** `/api/v1/elections/:id`

#### 4. Delete Election
**DELETE** `/api/v1/elections/:id`

---

## Cadre Management

### Base Path: `/api/v1/cadres`

#### 1. Get All Cadres
**GET** `/api/v1/cadres`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "firstName": "John",
      "lastName": "Doe",
      "mobileNumber": "9876543210",
      "role": "booth_agent",
      "boothAllocation": "119 ",
      "activeElection": "Thondamuthur",
      "status": "active"
    }
  ]
}
```

#### 2. Create Cadre
**POST** `/api/v1/cadres`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "9876543210",
  "password": "password123",
  "role": "booth_agent",
  "boothAllocation": "119 ",
  "activeElection": "Thondamuthur"
}
```

#### 3. Get Cadre by ID
**GET** `/api/v1/cadres/:id`

#### 4. Update Cadre
**PUT** `/api/v1/cadres/:id`

#### 5. Delete Cadre
**DELETE** `/api/v1/cadres/:id`

#### 6. Login
**POST** `/api/v1/cadres/login`

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "password": "password123"
}
```

---

## Survey Forms

### Base Path: `/api/v1/survey-forms`

#### 1. Get All Survey Forms
**GET** `/api/v1/survey-forms`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "formId": "survey-001",
      "title": "Voter Sentiment Survey 2024",
      "tamilTitle": "வாக்காளர் உணர்வு கணக்கெடுப்பு 2024",
      "description": "Detailed voter feedback and suggestions",
      "status": "Active",
      "questions": [
        {
          "questionId": "q1",
          "questionText": "What is your primary concern regarding the constituency?",
          "questionType": "single_choice",
          "options": [
            { "optionId": "o1", "optionText": "Infrastructure", "optionValue": "Infrastructure" },
            { "optionId": "o2", "optionText": "Employment", "optionValue": "Employment" }
          ],
          "required": true,
          "order": 1
        }
      ],
      "responseCount": 45,
      "createdAt": "2025-10-28T10:30:00.000Z"
    }
  ]
}
```

#### 2. Get Survey Form by ID
**GET** `/api/v1/survey-forms/:id`

#### 3. Create Survey Form
**POST** `/api/v1/survey-forms`

#### 4. Update Survey Form
**PUT** `/api/v1/survey-forms/:id`

#### 5. Delete Survey Form
**DELETE** `/api/v1/survey-forms/:id`

#### 6. Submit Survey Response
**POST** `/api/v1/survey-forms/:id/responses`

**Request Body:**
```json
{
  "respondentId": "voter123",
  "respondentName": "Rajesh Kumar",
  "respondentMobile": "+91 9876543210",
  "respondentAge": 45,
  "respondentVoterId": "TND119 0001",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Infrastructure"
    },
    {
      "questionId": "q2",
      "answer": "Very Satisfied"
    }
  ],
  "isComplete": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "response123",
    "formId": "survey-001",
    "respondentName": "Rajesh Kumar",
    "answers": [...],
    "submittedAt": "2025-10-28T10:30:00.000Z"
  },
  "message": "Survey response submitted successfully"
}
```

#### 7. Get Survey Responses
**GET** `/api/v1/survey-forms/:id/responses?page=1&limit=10`

#### 8. Get Completed Voters
**GET** `/api/v1/survey-forms/:id/completed-voters`

Get list of voter IDs who have completed this survey.

**Response:**
```json
{
  "success": true,
  "voterIds": ["TND119 0001", "TND119 0003", "TND119 0005"],
  "count": 3,
  "data": [
    {
      "respondentId": "voter123",
      "respondentVoterId": "TND119 0001",
      "respondentName": "Rajesh Kumar"
    }
  ]
}
```

---

## Surveys Management

### Base Path: `/api/v1/surveys`

#### 1. Get All Surveys
**GET** `/api/v1/surveys?limit=100`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "title": "Voter Opinion Survey",
      "description": "Collect voter opinions",
      "questionsCount": 10,
      "deadline": "2025-11-01",
      "status": "active",
      "responsesCount": 45,
      "targetCount": 100
    }
  ]
}
```

#### 2. Create Survey
**POST** `/api/v1/surveys`

**Request Body:**
```json
{
  "title": "Voter Opinion Survey",
  "description": "Collect voter opinions",
  "questions": [
    {
      "question": "What is your primary concern?",
      "type": "multiple_choice",
      "options": ["Education", "Healthcare", "Employment"]
    }
  ],
  "deadline": "2025-11-01"
}
```

#### 3. Get Survey by ID
**GET** `/api/v1/surveys/:id`

#### 4. Update Survey
**PUT** `/api/v1/surveys/:id`

#### 5. Delete Survey
**DELETE** `/api/v1/surveys/:id`

#### 6. Submit Survey Response
**POST** `/api/v1/surveys/:id/responses`

**Request Body:**
```json
{
  "voterId": "TND119 0007",
  "responses": [
    {
      "questionId": "q1",
      "answer": "Education"
    }
  ]
}
```

---

## Survey Forms

### Base Path: `/api/v1/survey-forms`

#### 1. Get All Survey Forms
**GET** `/api/v1/survey-forms`

#### 2. Create Survey Form
**POST** `/api/v1/survey-forms`

#### 3. Get Survey Form by ID
**GET** `/api/v1/survey-forms/:id`

#### 4. Update Survey Form
**PUT** `/api/v1/survey-forms/:id`

#### 5. Delete Survey Form
**DELETE** `/api/v1/survey-forms/:id`

---

## Profile Management

### Base Path: `/api/v1/profile`

#### 1. Get User Profile
**GET** `/api/v1/profile/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "firstName": "John",
    "lastName": "Doe",
    "mobileNumber": "9876543210",
    "role": "booth_agent",
    "boothAllocation": "119 ",
    "activeElection": "Thondamuthur",
    "email": "john@example.com"
  }
}
```

#### 2. Update Profile
**PUT** `/api/v1/profile/:userId`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

---

## Settings Management

### Base Path: `/api/v1/settings`

#### 1. Get All Settings
**GET** `/api/v1/settings`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "key": "app_version",
      "value": "1.0.0",
      "category": "general"
    }
  ]
}
```

#### 2. Create Setting
**POST** `/api/v1/settings`

#### 3. Update Setting
**PUT** `/api/v1/settings/:id`

#### 4. Delete Setting
**DELETE** `/api/v1/settings/:id`

#### 5. Voter Categories
**GET** `/api/v1/settings/voter-categories`

**POST** `/api/v1/settings/voter-categories`

#### 6. Voter Languages
**GET** `/api/v1/settings/voter-languages`

**POST** `/api/v1/settings/voter-languages`

---

## Catalogue Management

### Base Path: `/api/v1/catalogue`

#### 1. Get Catalogue Items
**GET** `/api/v1/catalogue?q=search&page=1&limit=10&category=education`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "title": "Education Initiative",
      "category": "education",
      "description": "Details about education program",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

#### 2. Get Single Catalogue Item
**GET** `/api/v1/catalogue/:id`

---

## Modal Content

### Base Path: `/api/v1/modal-content`

#### 1. Get All Modal Content
**GET** `/api/v1/modal-content`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "modalType": "about",
      "title": "About Us",
      "content": "Detailed about content..."
    },
    {
      "_id": "6543210abcdef2",
      "modalType": "help",
      "title": "Help & Support",
      "content": "Help content..."
    }
  ]
}
```

**Modal Types:**
- `about` - About application
- `help` - Help & support
- `terms` - Terms & conditions
- `privacy` - Privacy policy

#### 2. Create Modal Content
**POST** `/api/v1/modal-content`

#### 3. Update Modal Content
**PUT** `/api/v1/modal-content/:id`

---

## Vulnerabilities

### Base Path: `/api/v1/vulnerabilities`

#### 1. Get All Vulnerabilities
**GET** `/api/v1/vulnerabilities`

#### 2. Create Vulnerability
**POST** `/api/v1/vulnerabilities`

#### 3. Get Vulnerability by ID
**GET** `/api/v1/vulnerabilities/:id`

#### 4. Update Vulnerability
**PUT** `/api/v1/vulnerabilities/:id`

#### 5. Delete Vulnerability
**DELETE** `/api/v1/vulnerabilities/:id`

---

## Part Colors

### Base Path: `/api/v1/part-colors`

#### 1. Get All Part Colors
**GET** `/api/v1/part-colors`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "partNumber": "119 ",
      "color": "#FF5733",
      "colorName": "Red"
    }
  ]
}
```

#### 2. Create Part Color
**POST** `/api/v1/part-colors`

#### 3. Update Part Color
**PUT** `/api/v1/part-colors/:id`

---

## Voter Info

### Base Path: `/api/v1/voter-info`

#### Get Voter Information
**GET** `/api/v1/voter-info/:voterId`

Get comprehensive information about a voter including family, surveys, and statistics.

---

## Error Responses

All API endpoints follow a standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Header:** `X-RateLimit-Remaining` shows remaining requests
- **Reset:** Limits reset every 15 minutes

---

## Authentication

Most endpoints require authentication using JWT tokens.

**Include in request headers:**
```
Authorization: Bearer {your-jwt-token}
```

**Token expires:** 30 days

---

## Health Check

**GET** `/health`

Check API server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-28T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Swagger Documentation

Interactive API documentation available at:
```
http://192.168.10.137:5000/api-docs
```

---

## Security Features

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - DDoS protection
4. **MongoDB Sanitization** - Prevents NoSQL injection
5. **HPP** - HTTP parameter pollution prevention
6. **JWT** - Secure token-based authentication

---

## Database Collections

- `votersdata` - Main voter information
- `cadres` - Booth agents and coordinators
- `elections` - Election details
- `surveys` - Survey definitions
- `surveyresponses` - Survey responses
- `profiles` - User profiles
- `settings` - Application settings
- `modalcontents` - Modal content (about, help, etc.)
- `transgendervoters` - Transgender voters
- `fatherlessvoters` - Fatherless voters
- `guardianvoters` - Guardian voters
- `mobilevoters` - Mobile voters
- `age80abovevoters` - Age 80+ voters
- `age60abovevoters` - Age 60+ voters (60 and above)
- `catalogue` - Catalogue items
- `soonvoters` - Young voters (18-21)
- `vulnerabilities` - Vulnerability tracking
- `partcolors` - Part color mappings

---

## Frontend Integration Example

```typescript
// Example: Create Voter
const createVoter = async (voterData) => {
  const response = await fetch('http://192.168.10.137:5000/api/v1/voters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      voterId: voterData.voterId,
      fullName: voterData.fullName,
      age: voterData.age,
      gender: voterData.gender,
      phoneNumber: voterData.phoneNumber,
      address: voterData.address,
      familyId: voterData.familyId,
      specialCategories: voterData.specialCategories,
      partNumber: boothNumber,
    }),
  });
  
  return await response.json();
};
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination is available on list endpoints using `page` and `limit` query parameters
- All POST/PUT requests require `Content-Type: application/json` header
- File uploads (if any) use `multipart/form-data`
- API responses are cached with `no-cache` policy

---

**Last Updated:** October 28, 2025  
**API Version:** 1.0.0  
**Contact:** Kural Development Team
