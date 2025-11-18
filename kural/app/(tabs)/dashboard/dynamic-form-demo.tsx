/**
 * Example Screen: Dynamic Form Demo
 * Demonstrates how to use the Dynamic Field System in your React Native app
 * 
 * This is a complete working example you can copy and modify
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import DynamicForm from '../../../components/DynamicForm';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function DynamicFormDemo() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedFormType, setSelectedFormType] = useState('voter_registration');
  const [submitting, setSubmitting] = useState(false);

  // Form types available
  const formTypes = [
    {
      id: 'voter_registration',
      name: { english: 'Voter Registration', tamil: 'வாக்காளர் பதிவு' },
      description: { 
        english: 'Register new voters with dynamic fields',
        tamil: 'டைனமிக் புலங்களுடன் புதிய வாக்காளர்களைப் பதிவு செய்யவும்'
      }
    },
    {
      id: 'survey',
      name: { english: 'Survey Form', tamil: 'கணக்கெடுப்பு படிவம்' },
      description: { 
        english: 'Collect feedback and responses',
        tamil: 'கருத்துகள் மற்றும் பதில்களை சேகரிக்கவும்'
      }
    },
    {
      id: 'booth_agent',
      name: { english: 'Booth Agent', tamil: 'சாவடி முகவர்' },
      description: { 
        english: 'Register booth agents',
        tamil: 'சாவடி முகவர்களைப் பதிவு செய்யவும்'
      }
    },
    {
      id: 'custom_form',
      name: { english: 'Custom Form', tamil: 'தனிப்பயன் படிவம்' },
      description: { 
        english: 'Any custom form with dynamic fields',
        tamil: 'டைனமிக் புலங்களுடன் எந்த தனிப்பயன் படிவமும்'
      }
    }
  ];

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      // Simulate API call
      console.log('📤 Submitting form data:', formData);
      console.log('📋 Form type:', selectedFormType);

      // In real app, you would call your API here:
      // const response = await yourAPI.submitForm(selectedFormType, formData);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      Alert.alert(
        '✅ Success',
        `Form submitted successfully!\n\nForm Type: ${selectedFormType}\nFields: ${Object.keys(formData).length}`,
        [
          {
            text: 'View Data',
            onPress: () => {
              Alert.alert('Form Data', JSON.stringify(formData, null, 2));
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render form type selector
  const renderFormTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>
        {language === 'tamil' ? 'படிவ வகையைத் தேர்ந்தெடுக்கவும்' : 'Select Form Type'}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.formTypeScroll}
        contentContainerStyle={styles.formTypeScrollContent}
      >
        {formTypes.map((formType) => (
          <TouchableOpacity
            key={formType.id}
            style={[
              styles.formTypeCard,
              selectedFormType === formType.id && styles.formTypeCardSelected
            ]}
            onPress={() => setSelectedFormType(formType.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.formTypeName,
              selectedFormType === formType.id && styles.formTypeNameSelected
            ]}>
              {formType.name[language] || formType.name.english}
            </Text>
            <Text style={[
              styles.formTypeDescription,
              selectedFormType === formType.id && styles.formTypeDescriptionSelected
            ]}>
              {formType.description[language] || formType.description.english}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render info banner
  const renderInfoBanner = () => (
    <View style={styles.infoBanner}>
      <Text style={styles.infoBannerIcon}>ℹ️</Text>
      <View style={styles.infoBannerTextContainer}>
        <Text style={styles.infoBannerTitle}>
          {language === 'tamil' ? 'டைனமிக் புலம் அமைப்பு' : 'Dynamic Field System'}
        </Text>
        <Text style={styles.infoBannerText}>
          {language === 'tamil' 
            ? 'இந்தப் படிவம் உங்கள் டேட்டாபேஸிலிருந்து புலங்களை சுவீகரிக்கிறது. நிர்வாக பேனல் வழியாக புதிய புலங்களைச் சேர்க்கவும், அவை இங்கே தோன்றும்!'
            : 'This form dynamically loads fields from your database. Add new fields via admin panel and they appear here automatically!'
          }
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'tamil' ? 'டைனமிக் படிவம் டெமோ' : 'Dynamic Form Demo'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Info Banner */}
      {renderInfoBanner()}

      {/* Form Type Selector */}
      {renderFormTypeSelector()}

      {/* Dynamic Form */}
      <View style={styles.formContainer}>
        <DynamicForm
          formType={selectedFormType}
          onSubmit={handleSubmit}
          language={language}
          submitButtonText={language === 'tamil' ? 'சமர்ப்பிக்கவும்' : 'Submit Form'}
          showCategoryHeaders={true}
        />
      </View>

      {/* Loading Overlay */}
      {submitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>
              {language === 'tamil' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  infoBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoBannerTextContainer: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
  },
  selectorContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  formTypeScroll: {
    marginHorizontal: -16,
  },
  formTypeScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  formTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  formTypeCardSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  formTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  formTypeNameSelected: {
    color: '#1976D2',
  },
  formTypeDescription: {
    fontSize: 13,
    color: '#666666',
  },
  formTypeDescriptionSelected: {
    color: '#1976D2',
  },
  formContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
});
