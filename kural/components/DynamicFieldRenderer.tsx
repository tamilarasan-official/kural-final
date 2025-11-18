import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

/**
 * DynamicFieldRenderer Component
 * Dynamically renders form fields based on field configuration from backend
 * 
 * @param {Object} field - Field configuration object from backend
 * @param {Any} value - Current field value
 * @param {Function} onChange - Callback function when value changes
 * @param {String} language - Current language (english/tamil)
 * @param {Object} errors - Validation errors
 */
export default function DynamicFieldRenderer({ 
  field, 
  value, 
  onChange, 
  language = 'english',
  errors = {} 
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Get label in current language
  const getLabel = () => {
    return field.label?.[language] || field.label?.english || field.fieldId;
  };

  // Get placeholder in current language
  const getPlaceholder = () => {
    return field.placeholder?.[language] || field.placeholder?.english || '';
  };

  // Get help text in current language
  const getHelpText = () => {
    return field.helpText?.[language] || field.helpText?.english || '';
  };

  // Get option label in current language
  const getOptionLabel = (option) => {
    return option.label?.[language] || option.label?.english || option.value;
  };

  // Handle value change
  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(field.fieldId, newValue);
  };

  // Validate value based on field validation rules
  const validateValue = (val) => {
    const validation = field.validation || {};
    
    if (validation.required && !val) {
      return `${getLabel()} is required`;
    }
    
    if (validation.minLength && val?.length < validation.minLength) {
      return `${getLabel()} must be at least ${validation.minLength} characters`;
    }
    
    if (validation.maxLength && val?.length > validation.maxLength) {
      return `${getLabel()} must be at most ${validation.maxLength} characters`;
    }
    
    if (validation.min !== undefined && val < validation.min) {
      return `${getLabel()} must be at least ${validation.min}`;
    }
    
    if (validation.max !== undefined && val > validation.max) {
      return `${getLabel()} must be at most ${validation.max}`;
    }
    
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(val)) {
        return `${getLabel()} format is invalid`;
      }
    }
    
    return null;
  };

  // Render field based on type
  const renderField = () => {
    const config = field.config || {};
    const styling = field.styling || {};

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <TextInput
            style={[
              styles.textInput,
              styling.backgroundColor && { backgroundColor: styling.backgroundColor },
              styling.textColor && { color: styling.textColor },
              styling.borderColor && { borderColor: styling.borderColor },
              styling.fontSize && { fontSize: styling.fontSize },
              errors[field.fieldId] && styles.inputError
            ]}
            value={localValue || ''}
            onChangeText={handleChange}
            placeholder={getPlaceholder()}
            keyboardType={config.keyboardType || (field.fieldType === 'email' ? 'email-address' : field.fieldType === 'phone' ? 'phone-pad' : 'default')}
            autoCapitalize={config.autoCapitalize || 'none'}
            secureTextEntry={config.secureTextEntry || false}
            editable={config.editable !== false}
            maxLength={field.validation?.maxLength}
            multiline={config.multiline || false}
            numberOfLines={config.numberOfLines || 1}
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[
              styles.textArea,
              styling.backgroundColor && { backgroundColor: styling.backgroundColor },
              styling.textColor && { color: styling.textColor },
              styling.borderColor && { borderColor: styling.borderColor },
              errors[field.fieldId] && styles.inputError
            ]}
            value={localValue || ''}
            onChangeText={handleChange}
            placeholder={getPlaceholder()}
            multiline={true}
            numberOfLines={config.numberOfLines || 4}
            textAlignVertical="top"
            editable={config.editable !== false}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'number':
        return (
          <TextInput
            style={[
              styles.textInput,
              errors[field.fieldId] && styles.inputError
            ]}
            value={localValue?.toString() || ''}
            onChangeText={(text) => {
              const numValue = parseFloat(text);
              handleChange(isNaN(numValue) ? '' : numValue);
            }}
            placeholder={getPlaceholder()}
            keyboardType="numeric"
            editable={config.editable !== false}
          />
        );

      case 'date':
      case 'time':
      case 'datetime':
        return (
          <View>
            <TouchableOpacity
              style={[styles.dateButton, errors[field.fieldId] && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {localValue 
                  ? new Date(localValue).toLocaleDateString() 
                  : getPlaceholder() || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={localValue ? new Date(localValue) : new Date()}
                mode={field.fieldType === 'time' ? 'time' : field.fieldType === 'datetime' ? 'datetime' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    handleChange(selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>
        );

      case 'dropdown':
        return (
          <View style={[styles.pickerContainer, errors[field.fieldId] && styles.inputError]}>
            <Picker
              selectedValue={localValue}
              onValueChange={handleChange}
              enabled={config.editable !== false}
              style={styles.picker}
            >
              <Picker.Item label={getPlaceholder() || 'Select...'} value="" />
              {field.options?.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={getOptionLabel(option)}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        );

      case 'radio':
        return (
          <View style={styles.radioGroup}>
            {field.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioButton,
                  localValue === option.value && styles.radioButtonSelected
                ]}
                onPress={() => handleChange(option.value)}
                disabled={config.editable === false}
              >
                <View style={[
                  styles.radioCircle,
                  localValue === option.value && styles.radioCircleSelected
                ]}>
                  {localValue === option.value && (
                    <View style={styles.radioCircleInner} />
                  )}
                </View>
                <Text style={[
                  styles.radioLabel,
                  localValue === option.value && styles.radioLabelSelected
                ]}>
                  {getOptionLabel(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(localValue) ? localValue : [];
        return (
          <View style={styles.checkboxGroup}>
            {field.options?.map((option) => {
              const isChecked = checkboxValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxButton}
                  onPress={() => {
                    const newValues = isChecked
                      ? checkboxValues.filter((v) => v !== option.value)
                      : [...checkboxValues, option.value];
                    handleChange(newValues);
                  }}
                  disabled={config.editable === false}
                >
                  <View style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked
                  ]}>
                    {isChecked && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {getOptionLabel(option)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'switch':
        return (
          <View style={styles.switchContainer}>
            <Switch
              value={!!localValue}
              onValueChange={handleChange}
              disabled={config.editable === false}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={localValue ? '#1976D2' : '#f4f3f4'}
            />
          </View>
        );

      case 'slider':
        return (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={localValue || config.minimumValue || 0}
              onValueChange={handleChange}
              minimumValue={config.minimumValue || 0}
              maximumValue={config.maximumValue || 100}
              step={config.step || 1}
              minimumTrackTintColor="#1976D2"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#1976D2"
              disabled={config.editable === false}
            />
            <Text style={styles.sliderValue}>{localValue || 0}</Text>
          </View>
        );

      case 'rating':
        const maxRating = config.maximumValue || 5;
        return (
          <View style={styles.ratingContainer}>
            {[...Array(maxRating)].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleChange(index + 1)}
                disabled={config.editable === false}
              >
                <Text style={styles.ratingStar}>
                  {(localValue || 0) > index ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return (
          <Text style={styles.unsupportedField}>
            Unsupported field type: {field.fieldType}
          </Text>
        );
    }
  };

  // Check if field should be displayed based on conditional logic
  if (field.conditionalDisplay?.enabled) {
    // Conditional display logic would be implemented here
    // For now, we'll always show the field
  }

  return (
    <View style={[
      styles.fieldContainer,
      field.styling?.width === 'half' && styles.halfWidth,
      field.styling?.width === 'third' && styles.thirdWidth,
      field.styling?.width === 'quarter' && styles.quarterWidth,
    ]}>
      {/* Field Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {getLabel()}
          {field.validation?.required && (
            <Text style={styles.required}> *</Text>
          )}
        </Text>
      </View>

      {/* Field Input */}
      {renderField()}

      {/* Help Text */}
      {getHelpText() && (
        <Text style={styles.helpText}>{getHelpText()}</Text>
      )}

      {/* Error Message */}
      {errors[field.fieldId] && (
        <Text style={styles.errorText}>{errors[field.fieldId]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
  thirdWidth: {
    width: '31%',
  },
  quarterWidth: {
    width: '23%',
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  required: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#1976D2',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333333',
  },
  radioLabelSelected: {
    fontWeight: '600',
    color: '#1976D2',
  },
  checkboxGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    minWidth: 40,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingStar: {
    fontSize: 32,
    color: '#FFD700',
  },
  helpText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  unsupportedField: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});
