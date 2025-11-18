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
5. [Booth Management](#booth-management)
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

Register a new user/booth.

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
  "voterId": "TND111001",
  "fullName": "John Doe",
  "age": "35",
  "gender": "Male",
  "phoneNumber": "+91 9876543210",
  "address": "123 Main Street, Locality",
  "familyId": "F001",
  "specialCategories": ["Age 60+"],
  "partNumber": "111"
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
    "Number": "TND111001",
    "sex": "Male",
    "age": 35,
    "Part_no": 111,
    "Mobile No": "+91 9876543210",
    "address": "123 Main Street, Locality",
    "familyId": "F001",
    "specialCategories": ["Age 60+"],
    "createdAt": "2025-11-18T10:30:00.000Z"
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
  "Number": "TND111001",
  "age": "35",
  "partNo": "111",
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
      "Number": "TND111001",
      "age": 35,
      "sex": "Male",
      "Part_no": 111,
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
    "name": {
      "english": "John Doe",
      "tamil": "ஜான் டோ"
    },
    "voterID": "TND111001",
    "age": 35,
    "gender": "Male",
    "mobile": "9876543210",
    "address": "123 Main Street",
    "booth_id": "BOOTH001",
    "aci_id": 111,
    "verified": false,
    "surveyed": false
  }
}
```

#### 4. Get Voters by Booth ID ✨ UPDATED
**GET** `/api/v1/voters/by-booth/:aciId/:boothId?page=1&limit=50`

Get all voters in a specific booth filtered by ACI ID and Booth ID.

**Path Parameters:**
- `aciId` (required): ACI ID (Assembly Constituency In-charge ID)
- `boothId` (required): Booth ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Example:**
```
GET /api/v1/voters/by-booth/111/BOOTH001?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "voters": [
    {
      "_id": "6543210abcdef",
      "sr": 1,
      "name": {
        "english": "John Doe",
        "tamil": "ஜான் டோ"
      },
      "voterID": "TND111001",
      "age": 35,
      "gender": "Male",
      "mobile": "9876543210",
      "booth_id": "BOOTH001",
      "aci_id": 111,
      "aci_name": "METTUPALAYAM",
      "verified": false,
      "surveyed": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalVoters": 103,
    "limit": 50
  }
}
```

**Notes:**
- Both `aciId` and `boothId` are required parameters
- Voters are sorted by serial number (`sr`) in ascending order
- Name field is normalized with English and Tamil versions
- All voter fields are extracted from nested objects if present

**Error Responses:**
- `400` - Both aciId and boothId are required
- `500` - Failed to fetch voters by booth ID

#### 5. Get Voters by Part Number
**GET** `/api/v1/voters/by-part/:partNumber?page=1&limit=50`

Get all voters in a specific booth/part.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "Name": "John Doe",
      "Number": "TND111001",
      "age": 35,
      "Part_no": 111
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 500
  }
}
```

#### 6. Get Part Names
**GET** `/api/v1/voters/part-names`

Get list of all unique part numbers with names.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "partNumber": 111,
      "partName": "Booth 111",
      "partNameTamil": "பூத் 111"
    }
  ],
  "count": 150
}
```

#### 7. Get Voter Statistics
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

#### 8. Get Voters by Age Range
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
      "Part_no": 111
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

## Booth Management

### Base Path: `/api/v1/booths`

#### 1. Get All Booths
**GET** `/api/v1/booths`

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

#### 2. Create Booth
**POST** `/api/v1/booths`

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

#### 3. Get Booth by ID
**GET** `/api/v1/booths/:id`

#### 4. Update Booth
**PUT** `/api/v1/booths/:id`

#### 5. Delete Booth
**DELETE** `/api/v1/booths/:id`

#### 6. Login
**POST** `/api/v1/booths/login`

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
**GET** `/api/v1/surveys?page=1&limit=100&status=active&search=keyword&aci_id=111`

Get paginated list of surveys with optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status ('active', 'inactive', 'completed', 'all')
- `search` (optional): Search in title, tamilTitle, or description
- `aci_id` (optional): Filter surveys assigned to specific ACI (for booth agents)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6543210abcdef",
      "formId": "survey-001",
      "formNumber": 1,
      "title": "Voter Opinion Survey",
      "tamilTitle": "வாக்காளர் கருத்துக் கணக்கெடுப்பு",
      "description": "Collect voter opinions",
      "status": "active",
      "isPublished": true,
      "assignedACs": [111, 119],
      "createdAt": "2025-11-18T10:30:00.000Z",
      "responseCount": 45
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 45,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 2. Create Survey
**POST** `/api/v1/surveys`

Create a new survey form.

**Request Body:**
```json
{
  "formId": "survey-001",
  "formNumber": 1,
  "title": "Voter Opinion Survey",
  "tamilTitle": "வாக்காளர் கருத்துக் கணக்கெடுப்பு",
  "description": "Collect voter opinions on key issues",
  "status": "active",
  "isPublished": true,
  "assignedACs": [111, 119],
  "questions": [
    {
      "questionId": "q1",
      "questionText": "What is your primary concern?",
      "questionTextTamil": "உங்கள் முக்கிய கவலை என்ன?",
      "questionType": "single_choice",
      "options": [
        {
          "optionId": "o1",
          "optionText": "Education",
          "optionTextTamil": "கல்வி",
          "optionValue": "education"
        },
        {
          "optionId": "o2",
          "optionText": "Healthcare",
          "optionTextTamil": "சுகாதாரம்",
          "optionValue": "healthcare"
        }
      ],
      "required": true,
      "order": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "formId": "survey-001",
    "title": "Voter Opinion Survey",
    "status": "active",
    "createdAt": "2025-11-18T10:30:00.000Z"
  },
  "message": "Survey created successfully"
}
```

#### 3. Get Survey by ID
**GET** `/api/v1/surveys/:id`

Get detailed information about a specific survey.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "formId": "survey-001",
    "title": "Voter Opinion Survey",
    "tamilTitle": "வாக்காளர் கருத்துக் கணக்கெடுப்பு",
    "description": "Survey description",
    "status": "active",
    "questions": [...],
    "assignedACs": [111, 119],
    "responseCount": 45
  }
}
```

#### 4. Update Survey
**PUT** `/api/v1/surveys/:id`

Update survey details.

**Request Body:**
```json
{
  "title": "Updated Survey Title",
  "description": "Updated description",
  "status": "active",
  "questions": [...]
}
```

#### 5. Update Survey Status
**PUT** `/api/v1/surveys/:id/status`

Update only the survey status.

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6543210abcdef",
    "status": "inactive",
    "updatedAt": "2025-11-18T10:30:00.000Z"
  },
  "message": "Survey status updated successfully"
}
```

#### 6. Delete Survey
**DELETE** `/api/v1/surveys/:id`

Soft delete a survey (marks as deleted, doesn't remove from database).

**Response:**
```json
{
  "success": true,
  "message": "Survey deleted successfully"
}
```

#### 7. Get Survey Statistics
**GET** `/api/v1/surveys/stats`

Get overall survey statistics across all surveys.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSurveys": 10,
    "activeSurveys": 3,
    "completedSurveys": 7,
    "totalResponses": 450,
    "averageResponseRate": 75.5
  }
}
```

#### 8. Get Survey Progress by ACI
**GET** `/api/v1/surveys/progress?aci_id=111`

Get survey completion progress for a specific ACI.

**Query Parameters:**
- `aci_id` (required): ACI ID to get progress for

**Response:**
```json
{
  "success": true,
  "data": {
    "aciId": 111,
    "totalBoothAgents": 98,
    "completedSurveys": 45,
    "pendingSurveys": 53,
    "completionRate": 45.92,
    "boothProgress": [
      {
        "boothId": "BOOTH001",
        "agentName": "Agent_001",
        "completed": 5,
        "pending": 98,
        "lastUpdated": "2025-11-18T10:30:00.000Z"
      }
    ]
  }
}
```

#### 9. Get Booth Survey Statistics ✨ NEW
**GET** `/api/v1/surveys/booth-stats?aci_id=111&booth_id=BOOTH001`

Get survey statistics for a specific booth. Shows active surveys and response counts filtered by booth voters only.

**Query Parameters:**
- `aci_id` (required): ACI ID of the booth
- `booth_id` (required): Booth ID to get statistics for

**Response:**
```json
{
  "success": true,
  "data": {
    "activeSurveys": 3,
    "totalResponses": 5,
    "surveys": [
      {
        "surveyId": "691b7344f94d177a777a7cc4",
        "surveyTitle": "test",
        "formId": "691b7344f94d177a777a7cc4",
        "responseCount": 2
      },
      {
        "surveyId": "691ba41f230ad96b0b1a947e",
        "surveyTitle": "jello-123456",
        "formId": "691ba41f230ad96b0b1a947e",
        "responseCount": 2
      },
      {
        "surveyId": "691c2c656f3088adc3e582e8",
        "surveyTitle": "Test survey",
        "formId": "691c2c656f3088adc3e582e8",
        "responseCount": 1
      }
    ]
  }
}
```

**Notes:**
- Only counts responses from voters registered in the specified booth
- Filters by both `aci_id` and `booth_id` to ensure booth-specific statistics
- Only includes surveys with status "active"
- Response count is specific to voters in that booth only

**Error Response:**
```json
{
  "success": false,
  "message": "aci_id and booth_id are required"
}
```

#### 10. Get Completed Voters for Survey
**GET** `/api/v1/surveys/:id/completed-voters`

Get list of voters who have completed a specific survey.

**Response:**
```json
{
  "success": true,
  "voterIds": ["TND111001", "TND111002", "TND111003"],
  "count": 3,
  "data": [
    {
      "respondentId": "voter123",
      "respondentVoterId": "TND111001",
      "respondentName": "Rajesh Kumar",
      "submittedAt": "2025-11-18T10:30:00.000Z"
    }
  ]
}
```

#### 11. Submit Survey Response
**POST** `/api/v1/surveys/:id/responses`

Submit a survey response for a voter.

**Request Body:**
```json
{
  "respondentId": "voter123",
  "respondentName": "Rajesh Kumar",
  "respondentVoterId": "TND111001",
  "respondentMobile": "+91 9876543210",
  "respondentAge": 45,
  "answers": [
    {
      "questionId": "q1",
      "answer": "Education"
    },
    {
      "questionId": "q2",
      "answer": ["Healthcare", "Infrastructure"]
    }
  ]
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
    "respondentVoterId": "TND111001",
    "isComplete": true,
    "submittedAt": "2025-11-18T10:30:00.000Z"
  },
  "message": "Survey response submitted successfully"
}
```

**Error Responses:**
- `404` - Survey not found
- `400` - Survey is not active
- `400` - Response already submitted for this voter

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
- `booths` - Booth agents and coordinators
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

**Last Updated:** November 18, 2025  
**API Version:** 1.0.0  
**Contact:** Kural Development Team

---

## Recent Updates (November 18, 2025)

### ✨ New Features & Fixes

1. **Booth-Specific Survey Statistics** (`/api/v1/surveys/booth-stats`)
   - Added new endpoint to get survey statistics filtered by booth
   - Properly filters survey responses by `aci_id` AND `booth_id`
   - Each booth now shows accurate survey completion counts for its own voters only
   - Fixed issue where all booths under same ACI showed identical statistics

2. **Voter Endpoint Route Fix** (`/api/v1/voters`)
   - Fixed route mounting from `/api/v1/voter` (singular) to `/api/v1/voters` (plural)
   - Now matches frontend API expectations
   - Resolved 404 errors when fetching voters by booth

3. **Enhanced Get Voters by Booth** (`/api/v1/voters/by-booth/:aciId/:boothId`)
   - Updated to require both `aciId` and `boothId` path parameters
   - Improved data normalization for voter names (English/Tamil)
   - Better field extraction from nested objects
   - Proper pagination support with booth-specific totals

### 🐛 Bug Fixes

- Fixed syntax errors in optional chaining operators (`?.`)
- Improved error handling for booth statistics
- Added proper validation for required parameters
- Fixed duplicate index warnings in Mongoose schemas

### 🔧 Performance Improvements

- Optimized database queries with `.lean()` for faster response times
- Parallel query execution for count and find operations
- Efficient voter ID extraction for booth-specific filtering
- Background index creation for better performance
