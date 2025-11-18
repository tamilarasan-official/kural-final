# Dynamic Field Reflection System

## Overview

The Dynamic Field Reflection System allows you to add new fields through your admin panel and have them automatically appear in your React Native mobile app **without rebuilding the APK or changing source code**.

## Architecture

### Backend Components

1. **MongoDB Model**: `DynamicField.js`
   - Stores field configurations with full metadata
   - Supports 20+ field types
   - Includes validation rules, conditional display, and styling

2. **Controller**: `dynamicFieldController.js`
   - Handles CRUD operations for dynamic fields
   - Provides mobile-optimized endpoints
   - Supports bulk operations and field reordering

3. **API Routes**: `dynamicFieldRoutes.js`
   - Public endpoints for mobile app (no auth required)
   - Protected admin endpoints for field management

### Frontend Components

1. **API Service**: `dynamicField.ts`
   - Handles all API calls related to dynamic fields
   - Provides methods for fetching and managing fields

2. **DynamicFieldRenderer**: React Native component
   - Renders individual fields based on field type
   - Handles validation and error display
   - Supports all field types dynamically

3. **DynamicForm**: React Native component
   - Complete form renderer that fetches fields from backend
   - Groups fields by category
   - Handles form submission and validation

## Supported Field Types

| Field Type | Description | Use Case |
|------------|-------------|----------|
| `text` | Single line text input | Name, title, short answers |
| `textarea` | Multi-line text input | Description, comments, long answers |
| `number` | Numeric input | Age, quantity, price |
| `email` | Email input with validation | Email addresses |
| `phone` | Phone number input | Phone numbers |
| `date` | Date picker | Birth date, event date |
| `time` | Time picker | Event time, appointment time |
| `datetime` | Date and time picker | Timestamp, scheduled time |
| `dropdown` | Single select dropdown | Country, state, category |
| `radio` | Radio button group | Gender, yes/no, single choice |
| `checkbox` | Multiple checkboxes | Multiple selections, tags |
| `switch` | Toggle switch (boolean) | Enable/disable, true/false |
| `slider` | Numeric slider | Rating, range selection |
| `rating` | Star rating | Feedback, product rating |
| `image` | Image upload | Profile picture, photo |
| `file` | File upload | Document, PDF |
| `location` | GPS location picker | Address, location tracking |
| `signature` | Digital signature | Consent, approval |
| `barcode` | Barcode scanner | Product scanning |
| `qrcode` | QR code scanner | QR code scanning |

## How It Works

### 1. Admin Panel - Add New Field

When you add a field in your admin panel, it creates a document in MongoDB:

```javascript
{
  fieldId: "voter_address",
  label: {
    english: "Address",
    tamil: "முகவரி"
  },
  fieldType: "textarea",
  placeholder: {
    english: "Enter your address",
    tamil: "உங்கள் முகவரியை உள்ளிடவும்"
  },
  validation: {
    required: true,
    maxLength: 500
  },
  applicableTo: ["voter_registration"],
  status: "active",
  order: 5
}
```

### 2. Mobile App - Automatic Reflection

The mobile app automatically fetches and renders the new field:

```typescript
// In your React Native screen
import DynamicForm from '../components/DynamicForm';

export default function VoterRegistration() {
  const handleSubmit = async (formData) => {
    // Process form data
    console.log('Form submitted:', formData);
    // Call your API to save data
  };

  return (
    <DynamicForm
      formType="voter_registration"
      onSubmit={handleSubmit}
      language="english"
      submitButtonText="Register Voter"
    />
  );
}
```

### 3. No Code Changes Required

- New field appears automatically in the app
- No need to rebuild APK
- No need to update app version
- Works immediately for all users

## API Endpoints

### Public Endpoints (Mobile App)

#### Get All Fields for Mobile
```
GET /api/v1/dynamic-fields/mobile/all
Query Params: ?category=general&applicableTo=voter_registration
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "fieldId": "voter_name",
      "label": { "english": "Name", "tamil": "பெயர்" },
      "fieldType": "text",
      "validation": { "required": true },
      "order": 1
    }
  ],
  "count": 10,
  "timestamp": "2025-11-18T10:30:00Z"
}
```

#### Get Fields for Specific Form
```
GET /api/v1/dynamic-fields/form/:formType
Query Params: ?formId=12345
```

### Protected Endpoints (Admin)

#### Create New Field
```
POST /api/v1/dynamic-fields
Headers: Authorization: Bearer <token>
Body: {
  "fieldId": "voter_email",
  "label": { "english": "Email" },
  "fieldType": "email",
  "validation": { "required": true },
  "applicableTo": ["voter_registration"]
}
```

#### Update Field
```
PUT /api/v1/dynamic-fields/:id
Headers: Authorization: Bearer <token>
Body: { field updates }
```

#### Delete/Archive Field
```
DELETE /api/v1/dynamic-fields/:id
Headers: Authorization: Bearer <token>
```

#### Bulk Create Fields
```
POST /api/v1/dynamic-fields/bulk
Headers: Authorization: Bearer <token>
Body: {
  "fields": [...]
}
```

## Usage Examples

### Example 1: Simple Survey Form

```typescript
import DynamicForm from '../components/DynamicForm';

export default function SurveyScreen() {
  const handleSurveySubmit = async (formData) => {
    try {
      const response = await fetch('YOUR_API/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Survey submitted successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit survey');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DynamicForm
        formType="survey"
        formId="customer-feedback-2025"
        onSubmit={handleSurveySubmit}
        language="english"
        submitButtonText="Submit Survey"
        showCategoryHeaders={true}
      />
    </View>
  );
}
```

### Example 2: Custom Form with Initial Values

```typescript
import DynamicForm from '../components/DynamicForm';
import { useLanguage } from '../contexts/LanguageContext';

export default function EditProfileScreen() {
  const { language } = useLanguage();
  
  const initialValues = {
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    age: 30
  };

  const handleUpdate = async (formData) => {
    // Update user profile
  };

  return (
    <DynamicForm
      formType="custom_form"
      formId="user-profile"
      initialValues={initialValues}
      onSubmit={handleUpdate}
      language={language}
      submitButtonText="Update Profile"
    />
  );
}
```

### Example 3: Using Individual Field Renderer

```typescript
import React, { useState } from 'react';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';

export default function CustomFormScreen() {
  const [fieldValue, setFieldValue] = useState('');
  
  const fieldConfig = {
    fieldId: 'custom_field',
    label: { english: 'Enter Details' },
    fieldType: 'textarea',
    placeholder: { english: 'Type here...' },
    validation: { required: true, maxLength: 500 }
  };

  const handleChange = (fieldId, value) => {
    setFieldValue(value);
  };

  return (
    <View>
      <DynamicFieldRenderer
        field={fieldConfig}
        value={fieldValue}
        onChange={handleChange}
        language="english"
        errors={{}}
      />
    </View>
  );
}
```

## Adding New Field Types

To add support for new field types in the future:

### 1. Update Backend Model

Edit `backend/src/models/DynamicField.js`:

```javascript
fieldType: {
  type: String,
  enum: [
    'text',
    'textarea',
    // ... existing types
    'your_new_type'  // Add your new type
  ]
}
```

### 2. Update Frontend Renderer

Edit `kural/components/DynamicFieldRenderer.tsx`:

```typescript
switch (field.fieldType) {
  case 'text':
    // ... existing cases
  
  case 'your_new_type':
    return (
      // Your custom render logic
      <YourCustomComponent
        value={localValue}
        onChange={handleChange}
        // ... other props
      />
    );
}
```

## Admin Panel Integration

### Sample Field Creation Form

```javascript
// In your admin panel
const createField = async () => {
  const fieldData = {
    fieldId: "voter_caste",
    label: {
      english: "Caste",
      tamil: "சாதி"
    },
    fieldType: "dropdown",
    options: [
      { value: "general", label: { english: "General" } },
      { value: "obc", label: { english: "OBC" } },
      { value: "sc", label: { english: "SC" } },
      { value: "st", label: { english: "ST" } }
    ],
    validation: {
      required: true
    },
    applicableTo: ["voter_registration"],
    status: "active",
    order: 10
  };

  const response = await fetch('YOUR_API/dynamic-fields', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(fieldData)
  });

  if (response.ok) {
    alert('Field created! It will now appear in the mobile app.');
  }
};
```

## Field Configuration Reference

### Complete Field Object

```javascript
{
  // Required fields
  fieldId: "unique_field_identifier",
  label: {
    english: "Field Label",
    tamil: "தமிழ் லேபிள்"
  },
  fieldType: "text",
  
  // Optional fields
  placeholder: {
    english: "Enter value...",
    tamil: "மதிப்பை உள்ளிடவும்..."
  },
  helpText: {
    english: "Help text here",
    tamil: "உதவி உரை இங்கே"
  },
  
  // For dropdown, radio, checkbox
  options: [
    {
      value: "option1",
      label: { english: "Option 1", tamil: "விருப்பம் 1" },
      order: 1
    }
  ],
  
  // Validation rules
  validation: {
    required: true,
    minLength: 3,
    maxLength: 100,
    min: 0,
    max: 100,
    pattern: "^[A-Za-z]+$"  // Regex pattern
  },
  
  // Default value
  defaultValue: "",
  
  // Conditional display
  conditionalDisplay: {
    enabled: true,
    dependsOn: "other_field_id",
    condition: "equals",  // equals, notEquals, contains, greaterThan, lessThan
    value: "some_value"
  },
  
  // Field configuration
  config: {
    multiline: false,
    numberOfLines: 1,
    keyboardType: "default",
    autoCapitalize: "none",
    secureTextEntry: false,
    editable: true,
    step: 1,
    minimumValue: 0,
    maximumValue: 100,
    dateFormat: "DD/MM/YYYY",
    allowMultiple: false
  },
  
  // Display settings
  order: 1,
  category: "general",
  applicableTo: ["voter_registration", "survey"],
  formIds: ["form123"],
  
  // Styling
  styling: {
    width: "full",  // full, half, third, quarter
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    borderColor: "#E0E0E0",
    fontSize: 14
  },
  
  status: "active"  // active, inactive, archived
}
```

## Caching Strategy

The mobile app can cache field configurations to improve performance:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache fields
const cacheFields = async (formType, fields) => {
  const key = `dynamic_fields_${formType}`;
  await AsyncStorage.setItem(key, JSON.stringify(fields));
};

// Get cached fields
const getCachedFields = async (formType) => {
  const key = `dynamic_fields_${formType}`;
  const cached = await AsyncStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
};

// Use cached fields with refresh
const loadFieldsWithCache = async (formType) => {
  // Show cached data immediately
  const cached = await getCachedFields(formType);
  if (cached) {
    setFields(cached);
  }
  
  // Fetch fresh data in background
  const response = await dynamicFieldAPI.getFieldsForForm(formType);
  if (response.success) {
    setFields(response.data);
    await cacheFields(formType, response.data);
  }
};
```

## Benefits

✅ **No App Updates Required**: Add fields without rebuilding APK
✅ **Instant Reflection**: Changes appear immediately in the app
✅ **Multi-language Support**: Built-in English and Tamil support
✅ **Type Safety**: 20+ pre-built field types
✅ **Validation**: Comprehensive validation rules
✅ **Conditional Logic**: Show/hide fields based on conditions
✅ **Flexible Styling**: Customize appearance per field
✅ **Scalable**: Add unlimited fields and forms
✅ **Offline Support**: Optional caching for offline access

## Troubleshooting

### Fields Not Showing in App

1. Check field status is "active"
2. Verify `applicableTo` includes correct form type
3. Ensure API endpoint is accessible
4. Check network connectivity

### Validation Not Working

1. Verify validation rules in field config
2. Check field type supports validation
3. Ensure error handling is implemented

### Styling Issues

1. Check styling object in field config
2. Verify width values are valid
3. Test on different screen sizes

## Next Steps

1. **Create Admin Panel UI**: Build interface to manage dynamic fields
2. **Add More Field Types**: Extend with custom field types
3. **Implement Analytics**: Track field usage and completion rates
4. **Add Versioning**: Support field version history
5. **Create Templates**: Pre-built field templates for common use cases

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Check mobile app console logs
- Verify API endpoints with Postman
- Contact development team

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
