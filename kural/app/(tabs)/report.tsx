import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ReportScreen() {
  const { t } = useLanguage();
  const [showToast, setShowToast] = useState(true);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Compose the message once based on current language
    setMessage(`${t('nav.report')} Feature not available`);
    // Auto-hide after a few seconds
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [t]);
  
  return (
    <View style={styles.container}>
      {/* Empty state screen - feature intentionally unavailable */}
      {showToast && (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: 'rgba(33, 33, 33, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
