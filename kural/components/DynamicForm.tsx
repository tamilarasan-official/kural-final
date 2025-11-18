import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { dynamicFieldAPI } from '../services/api/dynamicField';

/**
 * DynamicForm Component
 * Renders a complete form with fields fetched dynamically from backend
 * 
 * @param {String} formType - Type of form (voter_registration, survey, etc.)
 * @param {String} formId - Optional specific form ID
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Callback function when form is submitted
 * @param {String} language - Current language (english/tamil)
 * @param {String} submitButtonText - Custom submit button text
 * @param {Boolean} showCategoryHeaders - Show category headers
 */
export default function DynamicForm({
  formType,
  formId = null,
  initialValues = {},
  onSubmit,
  language = 'english',
  submitButtonText = 'Submit',
  showCategoryHeaders = true,
}) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Load fields from backend
  const loadFields = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await dynamicFieldAPI.getFieldsForForm(formType, formId);

      if (response.success) {
        setFields(response.data || []);
      } else {
        Alert.alert('Error', 'Failed to load form fields');
      }
    } catch (error) {
      console.error('Error loading dynamic fields:', error);
      Alert.alert('Error', 'Failed to load form fields. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formType, formId]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  // Handle field value change
  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      const value = formValues[field.fieldId];
      const validation = field.validation || {};

      // Check required fields
      if (validation.required && !value) {
        const label = field.label?.[language] || field.label?.english || field.fieldId;
        newErrors[field.fieldId] = `${label} is required`;
      }

      // Check min length
      if (validation.minLength && value && value.length < validation.minLength) {
        const label = field.label?.[language] || field.label?.english || field.fieldId;
        newErrors[field.fieldId] = `${label} must be at least ${validation.minLength} characters`;
      }

      // Check max length
      if (validation.maxLength && value && value.length > validation.maxLength) {
        const label = field.label?.[language] || field.label?.english || field.fieldId;
        newErrors[field.fieldId] = `${label} must be at most ${validation.maxLength} characters`;
      }

      // Check min value
      if (validation.min !== undefined && value < validation.min) {
        const label = field.label?.[language] || field.label?.english || field.fieldId;
        newErrors[field.fieldId] = `${label} must be at least ${validation.min}`;
      }

      // Check max value
      if (validation.max !== undefined && value > validation.max) {
        const label = field.label?.[language] || field.label?.english || field.fieldId;
        newErrors[field.fieldId] = `${label} must be at most ${validation.max}`;
      }

      // Check pattern
      if (validation.pattern && value) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          const label = field.label?.[language] || field.label?.english || field.fieldId;
          newErrors[field.fieldId] = `${label} format is invalid`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    const category = field.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {});

  // Check if field should be displayed based on conditional logic
  const shouldDisplayField = (field) => {
    if (!field.conditionalDisplay?.enabled) {
      return true;
    }

    const dependsOnValue = formValues[field.conditionalDisplay.dependsOn];
    const conditionValue = field.conditionalDisplay.value;
    const condition = field.conditionalDisplay.condition;

    switch (condition) {
      case 'equals':
        return dependsOnValue === conditionValue;
      case 'notEquals':
        return dependsOnValue !== conditionValue;
      case 'contains':
        return Array.isArray(dependsOnValue) && dependsOnValue.includes(conditionValue);
      case 'greaterThan':
        return dependsOnValue > conditionValue;
      case 'lessThan':
        return dependsOnValue < conditionValue;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading form...</Text>
      </View>
    );
  }

  if (fields.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No fields available for this form</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadFields()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadFields(true)}
          colors={['#1976D2']}
        />
      }
    >
      {showCategoryHeaders ? (
        // Render fields grouped by category with headers
        Object.entries(groupedFields).map(([category, categoryFields]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryHeader}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <View style={styles.fieldsRow}>
              {categoryFields
                .filter(shouldDisplayField)
                .map((field) => (
                  <DynamicFieldRenderer
                    key={field.fieldId}
                    field={field}
                    value={formValues[field.fieldId]}
                    onChange={handleFieldChange}
                    language={language}
                    errors={errors}
                  />
                ))}
            </View>
          </View>
        ))
      ) : (
        // Render all fields without category headers
        <View style={styles.fieldsRow}>
          {fields
            .filter(shouldDisplayField)
            .map((field) => (
              <DynamicFieldRenderer
                key={field.fieldId}
                field={field}
                value={formValues[field.fieldId]}
                onChange={handleFieldChange}
                language={language}
                errors={errors}
              />
            ))}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          submitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1976D2',
  },
  fieldsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
