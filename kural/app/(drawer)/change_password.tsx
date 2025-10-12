import { useLanguage } from '../../contexts/LanguageContext';
import React from 'react';
import { View, Text } from 'react-native';

export default function ChangePasswordScreen() {
  const { t } = useLanguage();
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{t('drawer.changePassword')}</Text>
    </View>
  );
}


