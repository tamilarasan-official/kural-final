import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { masterDataAPI } from '../../services/api/masterData';

interface Question {
  prompt: string;
  type: 'text' | 'number' | 'select' | 'multiple-choice' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'dropdown';
  options?: {
    label: string;
    value: string;
    _id?: string;
  }[];
  isRequired: boolean;
  order: number;
}

interface Section {
  _id: string;
  name: string;
  description?: string;
  order: number;
  questions: Question[];
  isVisible: boolean;
  aci_id?: number[];
  aci_name?: string[];
}

export default function MasterDataScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, any>>>({});
  const [existingResponses, setExistingResponses] = useState<Record<string, any>>({});

  const voterId = params.voterId as string;
  const voterName = params.voterName as string;

  useEffect(() => {
    loadSections();
    loadExistingResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await masterDataAPI.getSections();
      
      if (response.success && response.data) {
        const sortedSections = response.data.sort((a: Section, b: Section) => a.order - b.order);
        setSections(sortedSections);
        
        // Initialize empty responses for all sections
        const initialResponses: Record<string, Record<string, any>> = {};
        sortedSections.forEach((section: Section) => {
          initialResponses[section._id] = {};
        });
        setResponses(initialResponses);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      Alert.alert('Error', 'Failed to load master data sections');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingResponses = async () => {
    try {
      const response = await masterDataAPI.getResponsesByVoter(voterId);
      
      if (response.success && response.data) {
        const existing: Record<string, any> = {};
        response.data.forEach((item: any) => {
          const sectionId = item.sectionId._id || item.sectionId;
          // The responses field is already an object from the API, not a Map
          existing[sectionId] = item.responses || {};
        });
        setExistingResponses(existing);
      }
    } catch (error) {
      console.error('Error loading existing responses:', error);
    }
  };

  const handleResponseChange = (sectionId: string, questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [questionId]: value,
      },
    }));
  };

  const validateSection = (section: Section): boolean => {
    const sectionResponses = responses[section._id];
    const existingSectionResponses = existingResponses[section._id] || {};
    
    // Check all required questions
    for (const question of section.questions) {
      if (question.isRequired) {
        const questionKey = question.prompt || `question_${question.order}`;
        const value = sectionResponses[questionKey] || existingSectionResponses[questionKey];
        
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          Alert.alert('Validation Error', `${question.prompt} is required`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSaveSection = async () => {
    try {
      const currentSection = sections[activeTabIndex];
      
      if (!currentSection) {
        Alert.alert('Error', 'No section selected');
        return;
      }

      // Validate required fields
      if (!validateSection(currentSection)) {
        return;
      }

      setSaving(true);

      // Get device info
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version?.toString() || 'unknown',
      };

      // Merge new responses with existing ones
      const finalResponses = {
        ...existingResponses[currentSection._id],
        ...responses[currentSection._id],
      };

      const response = await masterDataAPI.submitResponse({
        voterId,
        sectionId: currentSection._id,
        responses: finalResponses,
        deviceInfo,
      });

      if (response.success) {
        Alert.alert('Success', 'Data saved successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Move to next tab or go back if this is the last tab
              if (activeTabIndex < sections.length - 1) {
                setActiveTabIndex(activeTabIndex + 1);
              } else {
                router.back();
              }
            },
          },
        ]);

        // Update existing responses
        setExistingResponses(prev => ({
          ...prev,
          [currentSection._id]: finalResponses,
        }));

        // Clear current section responses (since they're now saved)
        setResponses(prev => ({
          ...prev,
          [currentSection._id]: {},
        }));
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = (question: Question, sectionId: string) => {
    const questionKey = question.prompt || `question_${question.order}`;
    const currentValue = responses[sectionId]?.[questionKey] || 
                        existingResponses[sectionId]?.[questionKey] || 
                        '';

    switch (question.type) {
      case 'text':
      case 'textarea':
        return (
          <TextInput
            style={[
              styles.input,
              question.type === 'textarea' && styles.textArea,
            ]}
            value={currentValue}
            onChangeText={(value) => handleResponseChange(sectionId, questionKey, value)}
            placeholder={`Enter ${question.prompt}`}
            multiline={question.type === 'textarea'}
            numberOfLines={question.type === 'textarea' ? 4 : 1}
          />
        );

      case 'number':
        return (
          <TextInput
            style={styles.input}
            value={currentValue?.toString() || ''}
            onChangeText={(value) => handleResponseChange(sectionId, questionKey, value)}
            placeholder={`Enter ${question.prompt}`}
            keyboardType="numeric"
          />
        );

      case 'select':
      case 'dropdown':
      case 'radio':
      case 'multiple-choice':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  currentValue === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleResponseChange(sectionId, questionKey, option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentValue === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleResponseChange(sectionId, questionKey, newValues);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      default:
        return <Text>Unsupported field type: {question.type}</Text>;
    }
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading master data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (sections.length === 0) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.emptyContainer}>
          <Icon name="info" size={48} color="#999" />
          <Text style={styles.emptyText}>No master data sections available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const currentSection = sections[activeTabIndex];

  return (
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Master Data</Text>
            {voterName && <Text style={styles.headerSubtitle}>{voterName}</Text>}
          </View>
        </View>

        {/* Section Selector Dropdown */}
        <View style={styles.selectorContainer}>
          <View style={styles.selectorWrapper}>
            <Icon name="folder" size={20} color="#64748B" style={styles.selectorIcon} />
            <View style={styles.selectorTextContainer}>
              <Text style={styles.selectorLabel}>Section {activeTabIndex + 1} of {sections.length}</Text>
              <Text style={styles.selectorTitle}>{currentSection.name}</Text>
            </View>
            {!!existingResponses[currentSection._id] && (
              <Icon name="check-circle" size={20} color="#10B981" />
            )}
          </View>
          
          {sections.length > 1 && (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, activeTabIndex === 0 && styles.navButtonDisabled]}
                onPress={() => setActiveTabIndex(Math.max(0, activeTabIndex - 1))}
                disabled={activeTabIndex === 0}
              >
                <Icon name="chevron-left" size={24} color={activeTabIndex === 0 ? '#CBD5E1' : '#2563EB'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, activeTabIndex === sections.length - 1 && styles.navButtonDisabled]}
                onPress={() => setActiveTabIndex(Math.min(sections.length - 1, activeTabIndex + 1))}
                disabled={activeTabIndex === sections.length - 1}
              >
                <Icon name="chevron-right" size={24} color={activeTabIndex === sections.length - 1 ? '#CBD5E1' : '#2563EB'} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {currentSection.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {currentSection.description}
              </Text>
            </View>
          )}

          {currentSection.questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => {
              const questionKey = question.prompt || `question_${question.order}`;
              return (
                <View key={index} style={styles.questionContainer}>
                  <Text style={styles.questionText}>
                    {question.prompt}
                    {question.isRequired && <Text style={styles.required}> *</Text>}
                  </Text>
                  {renderQuestion(question, currentSection._id)}
                </View>
              );
            })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveSection}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {activeTabIndex < sections.length - 1 ? 'Save & Next' : 'Save & Close'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F7FA',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectorWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  selectorIcon: {
    marginRight: 12,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  selectorTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  descriptionContainer: {
    backgroundColor: '#EFF6FF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  descriptionText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
    fontWeight: '500',
  },
  questionContainer: {
    marginBottom: 28,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 14,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  required: {
    color: '#EF4444',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
