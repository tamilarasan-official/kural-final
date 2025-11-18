# Dynamic Field System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DYNAMIC FIELD SYSTEM                             │
│                    Real-time Form Field Management                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN PANEL (Web)                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Create   │  │   Update   │  │   Delete   │  │  Reorder   │       │
│  │   Fields   │  │   Fields   │  │   Fields   │  │   Fields   │       │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘       │
│         │                │                │                │             │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────┘
          │                │                │                │
          │ POST           │ PUT            │ DELETE         │ PUT
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Node.js/Express)                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Protected API Endpoints                       │   │
│  │  POST   /api/v1/dynamic-fields        - Create field            │   │
│  │  GET    /api/v1/dynamic-fields        - Get all fields          │   │
│  │  GET    /api/v1/dynamic-fields/:id    - Get field by ID         │   │
│  │  PUT    /api/v1/dynamic-fields/:id    - Update field            │   │
│  │  DELETE /api/v1/dynamic-fields/:id    - Archive field           │   │
│  │  POST   /api/v1/dynamic-fields/bulk   - Bulk create             │   │
│  │  PUT    /api/v1/dynamic-fields/reorder - Reorder fields         │   │
│  │  GET    /api/v1/dynamic-fields/stats  - Get statistics          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Public API Endpoints                         │   │
│  │  GET /api/v1/dynamic-fields/mobile/all        - All active      │   │
│  │  GET /api/v1/dynamic-fields/form/:formType    - By form type    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   Controller & Business Logic                    │   │
│  │  • Validation                                                     │   │
│  │  • Authorization                                                  │   │
│  │  • Data transformation                                            │   │
│  │  • Error handling                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   DynamicField Collection                        │   │
│  │  {                                                                │   │
│  │    fieldId: "voter_name",                                        │   │
│  │    label: { english: "Name", tamil: "பெயர்" },                  │   │
│  │    fieldType: "text",                                            │   │
│  │    validation: { required: true, maxLength: 100 },               │   │
│  │    applicableTo: ["voter_registration"],                         │   │
│  │    status: "active",                                             │   │
│  │    order: 1,                                                      │   │
│  │    ...                                                            │   │
│  │  }                                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ GET (Public endpoint)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native / Expo)                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API Service Layer                           │   │
│  │  • dynamicFieldAPI.getAllForMobile()                             │   │
│  │  • dynamicFieldAPI.getFieldsForForm(type)                        │   │
│  │  • Caching with AsyncStorage                                      │   │
│  │  • Error handling                                                 │   │
│  └─────────────────────┬───────────────────────────────────────────┘   │
│                        │                                                 │
│                        ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      DynamicForm Component                       │   │
│  │  • Fetches fields from API                                       │   │
│  │  • Groups fields by category                                      │   │
│  │  • Handles form state                                             │   │
│  │  • Validates form data                                            │   │
│  │  • Submits to parent component                                    │   │
│  └─────────────────────┬───────────────────────────────────────────┘   │
│                        │                                                 │
│                        ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  DynamicFieldRenderer Component                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │   Text   │  │ Dropdown │  │  Radio   │  │  Switch  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  Number  │  │   Date   │  │ Checkbox │  │  Slider  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  • Renders based on fieldType                                    │   │
│  │  • Handles field validation                                       │   │
│  │  • Shows error messages                                           │   │
│  │  • Multi-language support                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         User Interface                           │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  [Name]            ________________________               │   │   │
│  │  │  [Email]           ________________________               │   │   │
│  │  │  [Phone]           ________________________               │   │   │
│  │  │  [Age]             ________________________               │   │   │
│  │  │  [Gender]          ○ Male  ○ Female  ○ Other              │   │   │
│  │  │  [Address]         ________________________               │   │   │
│  │  │                    ________________________               │   │   │
│  │  │                    ________________________               │   │   │
│  │  │                                                            │   │   │
│  │  │                    [ Submit Form ]                         │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

ADD NEW FIELD FLOW:
═════════════════════
Admin Panel → POST → Backend API → MongoDB
                                     │
                                     ▼
Mobile App ← GET ← Backend API ← MongoDB
             │
             ▼
DynamicForm renders new field automatically! ✨

FORM SUBMISSION FLOW:
════════════════════
User fills form → DynamicForm validates → Parent component receives data
                                          → POST to your API
                                          → Save to database

FIELD UPDATE FLOW:
═════════════════
Admin Panel → PUT → Backend API → MongoDB (version++)
                                    │
                                    ▼
Mobile App pulls to refresh → New field config loaded → UI updates ✨

CONDITIONAL DISPLAY FLOW:
════════════════════════
Field A value changes → DynamicForm checks conditionalDisplay
                      → Field B shows/hides based on condition ✨

┌─────────────────────────────────────────────────────────────────────────┐
│                         FIELD TYPE MAPPING                               │
└─────────────────────────────────────────────────────────────────────────┘

Database fieldType          →    React Native Component
──────────────────────────────────────────────────────────────
"text"                      →    <TextInput />
"textarea"                  →    <TextInput multiline />
"number"                    →    <TextInput keyboardType="numeric" />
"email"                     →    <TextInput keyboardType="email-address" />
"phone"                     →    <TextInput keyboardType="phone-pad" />
"date"                      →    <DateTimePicker mode="date" />
"time"                      →    <DateTimePicker mode="time" />
"datetime"                  →    <DateTimePicker mode="datetime" />
"dropdown"                  →    <Picker />
"radio"                     →    Custom Radio Button Group
"checkbox"                  →    Custom Checkbox Group
"switch"                    →    <Switch />
"slider"                    →    <Slider />
"rating"                    →    Custom Star Rating
"image"                     →    Image Upload Component
"file"                      →    File Upload Component
...and more!

┌─────────────────────────────────────────────────────────────────────────┐
│                     VALIDATION FLOW                                      │
└─────────────────────────────────────────────────────────────────────────┘

User enters value → DynamicFieldRenderer validates
                  → Check: required, minLength, maxLength, min, max, pattern
                  → Show error if invalid
                  → Clear error if valid

On form submit    → DynamicForm validates all fields
                  → Collect all errors
                  → Show alert if errors exist
                  → Call onSubmit if valid ✅

┌─────────────────────────────────────────────────────────────────────────┐
│                         CACHING STRATEGY                                 │
└─────────────────────────────────────────────────────────────────────────┘

App opens         → Check AsyncStorage for cached fields
                  → Display cached fields immediately (fast!)
                  → Fetch fresh fields from API in background
                  → Update cache and UI if changes detected

User pulls to     → Force fetch from API
refresh           → Update cache
                  → Update UI with new fields

Offline mode      → Use cached fields only
                  → Queue form submissions
                  → Sync when online

┌─────────────────────────────────────────────────────────────────────────┐
│                    SECURITY & AUTHENTICATION                             │
└─────────────────────────────────────────────────────────────────────────┘

Public Endpoints (Mobile App):
  GET /mobile/all              ✓ No auth required
  GET /form/:type              ✓ No auth required

Protected Endpoints (Admin):
  POST /dynamic-fields         ✗ Requires JWT token
  PUT /dynamic-fields/:id      ✗ Requires JWT token
  DELETE /dynamic-fields/:id   ✗ Requires JWT token
  ...all admin operations      ✗ Requires JWT token

Middleware:
  protect() → Verify JWT → Check user permissions → Allow/Deny

┌─────────────────────────────────────────────────────────────────────────┐
│                         SCALABILITY                                      │
└─────────────────────────────────────────────────────────────────────────┘

• Unlimited fields per form
• Unlimited forms
• Indexed MongoDB queries for fast retrieval
• Pagination support for large datasets
• Caching reduces API calls
• Lazy loading for better performance
• Can handle thousands of fields efficiently

┌─────────────────────────────────────────────────────────────────────────┐
│                         KEY BENEFITS                                     │
└─────────────────────────────────────────────────────────────────────────┘

✅ No Code Changes        - Add fields without touching mobile code
✅ No App Rebuild         - No need to recompile APK
✅ No App Store Updates   - Changes appear instantly
✅ Real-time Updates      - Fields update while app is running
✅ Multi-language         - Built-in English and Tamil support
✅ Type Safe              - 20+ pre-built field types
✅ Validated              - Comprehensive validation rules
✅ Flexible               - Conditional logic and styling
✅ Production Ready       - Complete with tests and docs
✅ Scalable               - Handles unlimited fields

```

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 18, 2025  
**Status**: ✅ Production Ready
