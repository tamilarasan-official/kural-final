import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HeaderBack from '../../components/HeaderBack';
import { useLanguage } from '../../../contexts/LanguageContext';
import { surveyFormAPI } from '../../../services/api/surveyForm';
import { surveyAPI } from '../../../services/api/survey';

const { width } = Dimensions.get('window');

export default function SurveyFormScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { surveyId } = useLocalSearchParams();
  
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any>({});

  // Helper function to get formId from surveyId by fetching from database
  const getFormIdFromSurveyId = async (surveyId: string) => {
    try {
      console.log('Fetching survey with ID:', surveyId);
      const response = await surveyAPI.getById(surveyId);
      console.log('Survey API response:', response);
      
      if (response.success && response.data && response.data.formId) {
        console.log('Found formId from database:', response.data.formId);
        return response.data.formId;
      }
      
      console.log('Survey data structure:', response);
      console.log('Survey data formId field:', response.data?.formId);
      return null;
    } catch (error) {
      console.error('Error fetching survey formId:', error);
      return null;
    }
  };

  useEffect(() => {
    if (surveyId) {
      loadSurveyForm();
    }
  }, [surveyId]);

  const loadSurveyForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formId = await getFormIdFromSurveyId(surveyId as string);
      if (!formId) {
        setError('Survey form not found');
        return;
      }
      
      const response = await surveyFormAPI.getById(formId);
      
      if (response.success) {
        setForm(response.data);
      } else {
        setError('Failed to load survey form');
      }
    } catch (err: any) {
      console.error('Error loading survey form:', err);
      setError(err.message || 'Failed to load survey form');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!answers['q1'] || !answers['q1'].trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      if (!answers['q2'] || !answers['q2'].trim()) {
        Alert.alert('Error', 'Please enter your mobile number');
        return;
      }

      // Validate required questions
      const requiredQuestions = form.questions.filter(q => q.required);
      const missingAnswers = requiredQuestions.filter(q => !answers[q.questionId]);
      
      if (missingAnswers.length > 0) {
        Alert.alert('Error', 'Please answer all required questions');
        return;
      }

      setSubmitting(true);

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = form.questions.find(q => q.questionId === questionId);
        return {
          questionId,
          answer,
          answerText: typeof answer === 'string' ? answer : JSON.stringify(answer),
          selectedOptions: Array.isArray(answer) ? answer : (answer ? [answer] : []),
          rating: typeof answer === 'number' ? answer : undefined
        };
      });

      // Extract user information from answers
      const respondentName = answers['q1'] || '';
      const respondentMobile = answers['q2'] || '';
      const respondentAge = answers['q3'] ? parseInt(answers['q3']) : undefined;
      const respondentCity = answers['q4'] || '';
      const respondentVoterId = answers['q5'] || '';

      const responseData = {
        respondentId: `user_${Date.now()}`,
        respondentName,
        respondentMobile,
        respondentAge,
        respondentCity,
        respondentVoterId,
        answers: formattedAnswers
      };

      const formId = await getFormIdFromSurveyId(surveyId as string);
      if (!formId) {
        Alert.alert('Error', 'Survey form not found');
        return;
      }
      
      const response = await surveyFormAPI.submitResponse(formId, responseData);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          'Survey submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit survey');
      }
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      Alert.alert('Error', err.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: any) => {
    const currentAnswer = answers[question.questionId];

    switch (question.questionType) {
      case 'text':
        return (
          <TextInput
            key={question.questionId}
            style={styles.textInput}
            placeholder={`${t('surveyForm.enter')} ${question.questionText}`}
            value={currentAnswer || ''}
            onChangeText={(text: string) => handleAnswerChange(question.questionId, text)}
            multiline={question.questionText.length > 50}
            numberOfLines={question.questionText.length > 50 ? 3 : 1}
          />
        );

      case 'single_choice':
        return (
          <View key={question.questionId} style={styles.optionsContainer}>
            {question.options.map((option: any) => (
              <TouchableOpacity
                key={option.optionId}
                style={[
                  styles.optionButton,
                  currentAnswer === option.optionValue && styles.selectedOption
                ]}
                onPress={() => handleAnswerChange(question.questionId, option.optionValue)}
              >
                <Text style={[
                  styles.optionText,
                  currentAnswer === option.optionValue && styles.selectedOptionText
                ]}>
                  {option.optionText}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple_choice':
        return (
          <View key={question.questionId} style={styles.optionsContainer}>
            {question.options.map((option: any) => {
              const isSelected = Array.isArray(currentAnswer) 
                ? currentAnswer.includes(option.optionValue)
                : false;
              
              return (
                <TouchableOpacity
                  key={option.optionId}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => {
                    const currentSelections = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const newSelections = isSelected
                      ? currentSelections.filter((item: string) => item !== option.optionValue)
                      : [...currentSelections, option.optionValue];
                    handleAnswerChange(question.questionId, newSelections);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {option.optionText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('surveyForm.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>{t('surveyForm.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('surveyForm.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSurveyForm}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderBack onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('surveyForm.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('surveyForm.notFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderBack onPress={() => router.push('/(tabs)/')} />
        <Text style={styles.headerTitle}>{t('survey.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Title */}
        <View style={styles.titleCard}>
          <Text style={styles.tamilTitle}>{form.tamilTitle}</Text>
          <Text style={styles.instructions}>{form.instructions}</Text>
        </View>


        {/* Survey Questions */}
        {form.questions.map((question: any) => (
          <View key={question.questionId} style={styles.questionCard}>
            <Text style={styles.questionText}>
              {question.questionText}
              {question.required && <Text style={styles.required}> *</Text>}
            </Text>
            {renderQuestion(question)}
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? t('surveyForm.submitting') : t('surveyForm.submitForm')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  /* removed custom status/time/battery UI */
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backIcon: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tamilTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
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
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
  },
  required: {
    color: '#EF4444',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
