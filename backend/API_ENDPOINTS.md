# Kural Backend API Endpoints

## Base URL
- **Local**: `http://localhost:5000`
- **Production**: `http://192.168.10.137:5000`
- **API Documentation**: `http://localhost:5000/api-docs` (Swagger UI)

---

## Authentication Endpoints

### 1. Register User (Admin/Assembly CI)
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Description**: Register a new admin or Assembly CI user

**Request Body:**
```json
{
  "name": "THONDAMUTHUR_CI",
  "phone": "917212000000",
  "password": "yourpassword",
  "role": "Assembly CI",
  "aci_id": "119",
  "aci_name": "THONDAMUTHUR"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "data": {
    "_id": "user-id",
    "name": "THONDAMUTHUR_CI",
    "phone": "917212000000",
    "role": "Assembly CI"
  }
}
```

---

### 2. Login User (Admin/Assembly CI)
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Description**: Login for Assembly CI and Admin users

**Request Body:**
```json
{
  "phone": "917212000000",
  "password": "yourpassword"
}
```

**Alternative (Email login):**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "data": {
    "_id": "user-id",
    "name": "THONDAMUTHUR_CI",
    "phone": "917212000000",
    "role": "Assembly CI",
    "aci_id": "119",
    "aci_name": "THONDAMUTHUR"
  }
}
```

---

## Booth Agent Endpoints

### 3. Login Booth Agent
- **Endpoint**: `POST /api/v1/booths/login`
- **Access**: Public
- **Description**: Login for Booth Agents

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "boothpassword"
}
```

**Alternative (Old field names):**
```json
{
  "mobileNumber": "9876543210",
  "password": "boothpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "data": {
    "_id": "booth-id",
    "name": "John Doe",
    "phone": "9876543210",
    "role": "Booth Agent",
    "boothAllocation": "Booth 1",
    "aci_id": "119",
    "booth_id": "B001"
  }
}
```

---

### 4. Create Booth Agent
- **Endpoint**: `POST /api/v1/booths`
- **Access**: Private (Requires Authentication)
- **Description**: Create a new booth agent

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "boothpassword",
  "role": "Booth Agent",
  "gender": "Male",
  "boothAllocation": "Booth 1",
  "status": "Active",
  "aci_id": "119",
  "aci_name": "THONDAMUTHUR",
  "booth_id": "B001",
  "booth_agent_id": "BA001",
  "address": {
    "street": "123 Main St",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "country": "India",
    "postalCode": "641001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booth created successfully",
  "data": {
    "_id": "booth-id",
    "name": "John Doe",
    "phone": "9876543210",
    "role": "Booth Agent",
    "boothAllocation": "Booth 1"
  }
}
```

---

### 5. Get All Booths
- **Endpoint**: `GET /api/v1/booths`
- **Access**: Private
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (all | Active | Inactive)
  - `search` (searches name, phone, booth allocation)
  - `booth` (filter by booth allocation)

**Example:**
```
GET /api/v1/booths?page=1&limit=20&status=Active&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [...array of booths...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6. Get Booth by ID
- **Endpoint**: `GET /api/v1/booths/:id`
- **Access**: Private

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "booth-id",
    "name": "John Doe",
    "phone": "9876543210",
    "role": "Booth Agent"
  }
}
```

---

### 7. Update Booth
- **Endpoint**: `PUT /api/v1/booths/:id`
- **Access**: Private

**Request Body:** (Same as Create, all fields optional)

---

### 8. Delete Booth
- **Endpoint**: `DELETE /api/v1/booths/:id`
- **Access**: Private

---

## Voter Endpoints

### 9. Get All Voters
- **Endpoint**: `GET /api/v1/voters`
- **Access**: Private
- **Query Parameters**: Similar to booths (page, limit, search, etc.)

---

### 10. Get Voter by ID
- **Endpoint**: `GET /api/v1/voters/:id`
- **Access**: Private

---

### 11. Create Voter
- **Endpoint**: `POST /api/v1/voters`
- **Access**: Private

**Request Body:**
```json
{
  "name": {
    "english": "Ramesh Kumar",
    "tamil": "ரமேஷ் குமார்"
  },
  "voterID": "ABC1234567",
  "fathername": "Kumar",
  "doornumber": "123",
  "age": 35,
  "gender": "Male",
  "mobile": "9876543210",
  "emailid": "ramesh@example.com",
  "address": "123 Main Street, Coimbatore",
  "DOB": "1990-01-01",
  "aadhar": "123456789012",
  "PAN": "ABCDE1234F",
  "religion": "Hindu",
  "ac": "119",
  "caste": "OC",
  "subcaste": "Gounder",
  "boothid": "B001",
  "boothagentid": "BA001",
  "partname": "DMK",
  "partno": 1
}
```

---

## Role-Based Access Control

### User Roles:
1. **Assembly CI** - Assembly Incharge
   - Login via: `POST /api/v1/auth/login`
   - Can create/manage booth agents
   - Can view all voters in their constituency
   - Full dashboard access

2. **Booth Agent** - Booth level workers
   - Login via: `POST /api/v1/booths/login`
   - Can view/manage voters in their assigned booth
   - Limited dashboard access

3. **Admin** - System administrators
   - Login via: `POST /api/v1/auth/login`
   - Full system access

---

## Production Database Credentials

### Assembly CI - THONDAMUTHUR
- **Phone**: `917212000000`
- **Role**: `Assembly CI`
- **ACI ID**: `119`
- **ACI Name**: `THONDAMUTHUR`
- **Password**: Contact admin (bcrypt hashed in database)

### Test Credentials (If available)
- **Assembly CI**: Use actual phone number from database
- **Booth Agent**: Create via POST /api/v1/booths endpoint

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Please provide phone/email and password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 423 Locked
```json
{
  "success": false,
  "error": "Account is locked due to too many failed login attempts"
}
```

---

## Important Notes

1. **Authentication**: All private endpoints require JWT token in Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **Phone Number Format**: Store without country code prefix (e.g., `917212000000` not `+917212000000`)

3. **Password Security**: Passwords are bcrypt hashed with 10 rounds

4. **Assembly CI vs Booth Agent**:
   - Assembly CI users are in `users` collection
   - Booth Agents are in `booths` collection
   - Different login endpoints!

5. **Frontend Integration**:
   - Assembly CI → Use `/api/v1/auth/login`
   - Booth Agent → Use `/api/v1/booths/login`
   - Check user role in response to route to correct dashboard

---

## Database Collections

- **users**: Admin and Assembly CI users (328 documents)
- **voters**: Voter records (20,001 documents)
- **booths**: Booth agents (check current count)
- **surveyquestions**: Survey questions
- **surveyresponses**: Survey responses
- **applanguages**: Application language settings
- **aclistweb**: Assembly constituency list

---

## Next Steps

1. ✅ Backend connected to production MongoDB
2. ✅ Models updated to match production schema
3. ✅ Controllers support both old and new field names
4. ⏳ Frontend needs to:
   - Use correct login endpoint based on role
   - Handle role-based routing
   - Store JWT token for authenticated requests
   - Display correct phone format
