# Dynamic Field System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Seed Initial Fields (Backend)

```bash
cd backend
node scripts/seed-dynamic-fields.js
```

This creates sample fields in MongoDB that you can test immediately.

### Step 2: Test API Endpoints

Open your browser or Postman and test:

```
http://localhost:5000/api/v1/dynamic-fields/mobile/all
```

You should see a JSON response with all active fields.

### Step 3: Use in React Native App

Create a new screen or update an existing one:

```tsx
// app/(tabs)/dynamic-form-test.tsx
import React from 'react';
import { View, Alert } from 'react-native';
import DynamicForm from '../../components/DynamicForm';

export default function DynamicFormTest() {
  const handleSubmit = async (formData) => {
    console.log('Form submitted:', formData);
    Alert.alert('Success', 'Form submitted successfully!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <DynamicForm
        formType="voter_registration"
        onSubmit={handleSubmit}
        language="english"
        submitButtonText="Submit"
      />
    </View>
  );
}
```

### Step 4: Test the App

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your mobile app:
   ```bash
   cd kural
   npm start
   ```

3. Navigate to your test screen and see the dynamic fields!

---

## 📝 Adding New Fields via API

### Using curl:

```bash
curl -X POST http://localhost:5000/api/v1/dynamic-fields \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fieldId": "voter_income",
    "label": {
      "english": "Annual Income",
      "tamil": "ஆண்டு வருமானம்"
    },
    "fieldType": "dropdown",
    "options": [
      {
        "value": "below_2",
        "label": { "english": "Below 2 Lakhs" }
      },
      {
        "value": "2_to_5",
        "label": { "english": "2-5 Lakhs" }
      },
      {
        "value": "above_5",
        "label": { "english": "Above 5 Lakhs" }
      }
    ],
    "validation": { "required": false },
    "applicableTo": ["voter_registration"],
    "status": "active",
    "order": 9
  }'
```

### Using JavaScript/Admin Panel:

```javascript
const createField = async () => {
  const response = await fetch('http://localhost:5000/api/v1/dynamic-fields', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fieldId: 'voter_income',
      label: {
        english: 'Annual Income',
        tamil: 'ஆண்டு வருமானம்'
      },
      fieldType: 'dropdown',
      options: [
        { value: 'below_2', label: { english: 'Below 2 Lakhs' } },
        { value: '2_to_5', label: { english: '2-5 Lakhs' } },
        { value: 'above_5', label: { english: 'Above 5 Lakhs' } }
      ],
      validation: { required: false },
      applicableTo: ['voter_registration'],
      status: 'active',
      order: 9
    })
  });

  if (response.ok) {
    console.log('✅ Field created successfully!');
    // Refresh mobile app - new field appears automatically!
  }
};
```

---

## 🎯 Common Use Cases

### Use Case 1: Add a New Required Text Field

```javascript
{
  fieldId: "voter_aadhar",
  label: {
    english: "Aadhar Number",
    tamil: "ஆதார் எண்"
  },
  fieldType: "text",
  placeholder: {
    english: "Enter 12-digit Aadhar number"
  },
  validation: {
    required: true,
    minLength: 12,
    maxLength: 12,
    pattern: "^[0-9]{12}$"
  },
  config: {
    keyboardType: "numeric"
  },
  applicableTo: ["voter_registration"],
  status: "active",
  order: 10
}
```

### Use Case 2: Add a Conditional Field

```javascript
{
  fieldId: "voter_student_id",
  label: {
    english: "Student ID"
  },
  fieldType: "text",
  conditionalDisplay: {
    enabled: true,
    dependsOn: "voter_occupation",
    condition: "equals",
    value: "student"
  },
  validation: {
    required: true
  },
  applicableTo: ["voter_registration"],
  status: "active",
  order: 11
}
```

This field only appears when occupation = "student"!

### Use Case 3: Add a Rating Field

```javascript
{
  fieldId: "service_rating",
  label: {
    english: "Rate Our Service",
    tamil: "எங்கள் சேவையை மதிப்பிடுங்கள்"
  },
  fieldType: "rating",
  config: {
    maximumValue: 5
  },
  validation: {
    required: true,
    min: 1,
    max: 5
  },
  applicableTo: ["survey"],
  status: "active",
  order: 1
}
```

---

## 🔄 Update Existing Field

```bash
curl -X PUT http://localhost:5000/api/v1/dynamic-fields/FIELD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "label": {
      "english": "Updated Label"
    },
    "validation": {
      "required": true
    }
  }'
```

---

## 🗑️ Delete/Archive Field

```bash
curl -X DELETE http://localhost:5000/api/v1/dynamic-fields/FIELD_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Field is archived (not permanently deleted) and won't appear in mobile app.

---

## 📱 Mobile App Integration Examples

### Example 1: Voter Registration with Dynamic Fields

```tsx
import DynamicForm from '../components/DynamicForm';
import { voterAPI } from '../services/api/voter';

export default function VoterRegistration() {
  const handleSubmit = async (formData) => {
    try {
      const response = await voterAPI.register(formData);
      if (response.success) {
        Alert.alert('Success', 'Voter registered successfully!');
        router.push('/(tabs)/');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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

### Example 2: Survey with Pre-filled Data

```tsx
import { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import { useAuth } from '../contexts/AuthContext';

export default function SurveyScreen() {
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    // Pre-fill with user data
    setInitialValues({
      survey_name: user.name,
      survey_email: user.email,
      survey_phone: user.phone
    });
  }, [user]);

  const handleSubmit = async (formData) => {
    // Submit survey
  };

  return (
    <DynamicForm
      formType="survey"
      formId="customer-feedback"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      language="tamil"
      submitButtonText="சமர்ப்பிக்கவும்"
    />
  );
}
```

---

## 🧪 Testing the System

### Test 1: Create a Field and See It in App

1. Add a field via API:
   ```bash
   curl -X POST http://localhost:5000/api/v1/dynamic-fields ...
   ```

2. Pull to refresh in mobile app

3. New field appears instantly! ✨

### Test 2: Update Field Label

1. Update field:
   ```bash
   curl -X PUT http://localhost:5000/api/v1/dynamic-fields/ID ...
   ```

2. Refresh mobile app

3. Label updates automatically! 🎉

### Test 3: Archive Field

1. Archive field:
   ```bash
   curl -X DELETE http://localhost:5000/api/v1/dynamic-fields/ID ...
   ```

2. Refresh mobile app

3. Field disappears! 👋

---

## 🎨 Customization Options

### Field Width

```javascript
styling: {
  width: "half"  // full, half, third, quarter
}
```

### Custom Colors

```javascript
styling: {
  backgroundColor: "#E3F2FD",
  textColor: "#1976D2",
  borderColor: "#1976D2"
}
```

### Custom Keyboard

```javascript
config: {
  keyboardType: "email-address"  // numeric, phone-pad, url, etc.
}
```

---

## 📊 Field Types Quick Reference

| Type | Use For |
|------|---------|
| `text` | Names, titles, short text |
| `textarea` | Long text, descriptions |
| `number` | Age, quantity, amounts |
| `email` | Email addresses |
| `phone` | Phone numbers |
| `date` | Birth dates, event dates |
| `dropdown` | Single selection from list |
| `radio` | Single choice (visual buttons) |
| `checkbox` | Multiple selections |
| `switch` | Yes/No, Enable/Disable |
| `slider` | Numeric range |
| `rating` | Star ratings |

---

## 🐛 Troubleshooting

### Fields Not Showing?

1. Check field status is `"active"`
2. Verify `applicableTo` array includes your form type
3. Check API response in Network tab
4. Pull to refresh in app

### Validation Not Working?

1. Check validation object in field config
2. Verify field type supports validation
3. Check error messages in console

### Can't Create Field?

1. Check authentication token
2. Verify user has admin permissions
3. Check field data structure
4. Look for errors in backend logs

---

## 🎓 Next Steps

1. ✅ Run seed script
2. ✅ Test API endpoints
3. ✅ Create test screen in app
4. ✅ Add a new field via API
5. ✅ See it appear in app automatically
6. 🚀 Build your admin panel
7. 🎉 Deploy to production

---

## 💡 Pro Tips

1. **Use meaningful fieldIds**: `voter_phone` not `field1`
2. **Add help text**: Helps users understand what to enter
3. **Set proper validation**: Prevents bad data
4. **Use categories**: Organizes fields in sections
5. **Test on device**: Some field types behave differently
6. **Cache fields**: Improve performance with AsyncStorage
7. **Version control**: Track field changes over time

---

## 📞 Support

- Documentation: See `DYNAMIC_FIELD_SYSTEM.md`
- Backend Logs: `backend/logs/`
- API Documentation: `http://localhost:5000/api-docs`

---

**Happy Coding! 🎉**
