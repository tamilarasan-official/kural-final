import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  const { t } = useLanguage();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t('modal.title')}</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">{t('modal.goToHome')}</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
