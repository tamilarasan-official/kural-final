import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { surveyAPI } from '../../services/api/survey';

export default function SurveyQuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const surveyId = params.surveyId as string;
  const surveyTitle = params.surveyTitle as string;
  const voterId = params.voterId as string;
  const voterName = params.voterName as string;
  const voterAge = params.voterAge as string;
  const voterMobile = params.voterMobile as string;

  useEffect(() => {
    loadSurveyQuestions();
  }, []);

  const loadSurveyQuestions = async () => {
    try {
      setLoading(true);
      
      console.log('==========================================');
      console.log('Loading survey questions for ID:', surveyId);
      console.log('Survey Title:', surveyTitle);
      console.log('==========================================');
      
      // Load survey form questions
      const response = await surveyAPI.getById(surveyId);
      console.log('Survey Questions Response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response.data) {
        const surveyData = response.data;
        console.log('Survey Data formId:', surveyData.formId);
        console.log('Survey Data _id:', surveyData._id);
        console.log('Survey Data title:', surveyData.title);
        
        const questionsList = surveyData.questions || [];
        
        console.log('Questions loaded:', questionsList.length);
        console.log('Full questions array:', JSON.stringify(questionsList, null, 2));
        
        if (questionsList.length > 0) {
          questionsList.forEach((q: any, idx: number) => {
            console.log(`\n--- Question ${idx + 1} ---`);
            console.log('  Question ID:', q.questionId);
            console.log('  Question Text:', q.questionText);
            console.log('  Question Type:', q.questionType);
            console.log('  Options count:', q.options?.length || 0);
            console.log('  Required:', q.required);
            console.log('  Order:', q.order);
            if (q.options && q.options.length > 0) {
              console.log('  First option:', JSON.stringify(q.options[0]));
              console.log('  All options:', JSON.stringify(q.options));
            } else {
              console.log('  ⚠️ WARNING: No options found for this question!');
            }
          });
        }
        
        // Sort questions by order
        questionsList.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        
        setQuestions(questionsList);
        
        if (questionsList.length === 0) {
          Alert.alert('No Questions', 'This survey has no questions configured.');
          router.back();
        }
      } else {
        console.error('Invalid response format:', response);
        Alert.alert('Error', 'No questions found for this survey');
        router.back();
      }
    } catch (error: any) {
      console.error('Failed to load survey questions:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Failed to load survey questions: ${error.message}`);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionValue: string) => {
    const question = questions[currentQuestionIndex];
    
    if (question.questionType === 'multiple_choice') {
      // Multiple selection
      const currentAnswers = answers[questionId] || [];
      if (currentAnswers.includes(optionValue)) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter((v: string) => v !== optionValue),
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, optionValue],
        });
      }
    } else {
      // Single selection
      setAnswers({
        ...answers,
        [questionId]: optionValue,
      });
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Validate required questions
    if (currentQuestion.required && !answers[currentQuestion.questionId]) {
      Alert.alert('Required', 'Please answer this question before proceeding.');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Validate last question
    if (currentQuestion.required && !answers[currentQuestion.questionId]) {
      Alert.alert('Required', 'Please answer this question before submitting.');
      return;
    }

    Alert.alert(
      'Submit Survey',
      'Are you sure you want to submit this survey response?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);

              // Format answers for submission
              const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
              }));

              const responseData = {
                formId: surveyId,
                respondentId: voterId,
                respondentName: voterName,
                respondentMobile: voterMobile,
                respondentAge: parseInt(voterAge) || 0,
                respondentVoterId: voterId,
                answers: formattedAnswers,
                isComplete: true,
              };

              console.log('Submitting response:', responseData);

              const response = await surveyAPI.submitResponse(surveyId, responseData);

              if (response?.success) {
                Alert.alert(
                  'Success',
                  'Survey response submitted successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.push('/(boothAgent)/surveys'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to submit survey response');
              }
            } catch (error) {
              console.error('Failed to submit survey:', error);
              Alert.alert('Error', 'Failed to submit survey response. Please try again.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Icon name="assignment" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No questions available</Text>
        <TouchableOpacity style={styles.backButtonEmpty} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surveyTitle || 'Survey'}</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
      </View>

      {/* Voter Info */}
      <View style={styles.voterInfo}>
        <View style={styles.voterAvatar}>
          <Icon name="person" size={20} color="#2196F3" />
        </View>
        <View style={styles.voterDetails}>
          <Text style={styles.voterName}>{voterName}</Text>
          <Text style={styles.voterMeta}>
            {voterId} • {voterAge}y • {voterMobile || 'No mobile'}
          </Text>
        </View>
        <View style={styles.surveyingBadge}>
          <Text style={styles.surveyingText}>Surveying</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Question Content */}
      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {(!currentQuestion.options || currentQuestion.options.length === 0) ? (
            <View style={styles.noOptionsContainer}>
              <Icon name="error-outline" size={48} color="#FF9800" />
              <Text style={styles.noOptionsText}>No options available for this question</Text>
              <Text style={styles.noOptionsSubtext}>Please contact the administrator</Text>
            </View>
          ) : (
            currentQuestion.options.map((option: any, index: number) => {
              const isSelected = currentQuestion.questionType === 'multiple_choice'
                ? (answers[currentQuestion.questionId] || []).includes(option.optionValue)
                : answers[currentQuestion.questionId] === option.optionValue;

              // Use combination of optionId and index to ensure unique keys
              const uniqueKey = `${currentQuestion.questionId}-${option.optionId || option.optionValue || index}-${index}`;

              return (
                <TouchableOpacity
                  key={uniqueKey}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleSelectOption(currentQuestion.questionId, option.optionValue)}
                >
                  <View style={styles.optionIcon}>
                    {isSelected ? (
                      <Icon name="radio-button-checked" size={24} color="#2196F3" />
                    ) : (
                      <Icon name="radio-button-unchecked" size={24} color="#ccc" />
                    )}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.optionText}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Icon name="arrow-back" size={20} color="#2196F3" />
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  backButtonEmpty: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  voterInfo: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voterDetails: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  voterMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  surveyingBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  surveyingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  noOptionsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  noOptionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginTop: 16,
    textAlign: 'center',
  },
  noOptionsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#2196F3',
  },
  navigationContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
