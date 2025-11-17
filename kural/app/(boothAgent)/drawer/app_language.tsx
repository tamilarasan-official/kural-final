import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage, Language } from '../../../contexts/LanguageContext';

const languages = [
  { id: 'en' as Language, labelKey: 'language.english', character: 'A', label: 'English' },
  { id: 'hi' as Language, labelKey: 'language.hindi', character: 'क', label: 'Hindi' },
  { id: 'ta' as Language, labelKey: 'language.tamil', character: 'அ', label: 'Tamil' },
  { id: 'te' as Language, labelKey: 'language.telugu', character: 'ల', label: 'Telugu' },
  { id: 'kn' as Language, labelKey: 'language.kannada', character: 'ಹ', label: 'Kannada' },
  { id: 'ml' as Language, labelKey: 'language.malayalam', character: 'സ', label: 'Malayalam' },
];

export default function AppLanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageSelect = (languageId: Language) => {
    setSelectedLanguage(languageId);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await setLanguage(selectedLanguage);
      console.log('Selected language:', selectedLanguage);
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Error saving language:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : (
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{t ? t('language.title') : 'Select Language'}</Text>

      {/* Language Grid */}
      <View style={styles.languageGrid}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageButton,
              selectedLanguage === lang.id && styles.selectedLanguageButton
            ]}
            onPress={() => handleLanguageSelect(lang.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.languageCharacter,
              selectedLanguage === lang.id && styles.selectedLanguageCharacter
            ]}>
              {lang.character}
            </Text>
            <Text
              style={[
                styles.languageName,
                selectedLanguage === lang.id && styles.selectedLanguageName,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              allowFontScaling={false}
            >
              {t ? t(lang.labelKey) : lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{t ? t('common.submit') : 'Submit'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  languageButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedLanguageButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  languageCharacter: {
    fontSize: 32,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  selectedLanguageCharacter: {
    color: '#000000',
  },
  languageName: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  selectedLanguageName: {
    color: '#000000',
  },
  submitButtonContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
