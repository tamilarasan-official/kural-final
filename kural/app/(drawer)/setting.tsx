import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 columns with padding

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    { id: 'setElection', title: 'Set Election', icon: '🎯', route: '/drawer/set_election' },
    { id: 'appBanner', title: 'App Banner', icon: '📢', route: '/drawer/app_banner' },
    { id: 'history', title: 'History', icon: '🔄', route: '/drawer/history' },
    { id: 'category', title: 'Category', icon: '📊', route: '/drawer/category' },
    { id: 'voterSlip', title: 'Voter Slip', icon: '🎫', route: '/drawer/voter_slip' },
    { id: 'party', title: 'Party', icon: '🏳️', route: '/drawer/party' },
    { id: 'religion', title: 'Religion', icon: '🙏', route: '/drawer/religion' },
    { id: 'casteCategory', title: 'Caste Category', icon: '📈', route: '/drawer/caste_category' },
    { id: 'caste', title: 'Caste', icon: '📈', route: '/drawer/caste' },
    { id: 'subCaste', title: 'Sub-Caste', icon: '👥', route: '/drawer/sub_caste' },
    { id: 'language', title: 'Language', icon: '🔤', route: '/drawer/language' },
    { id: 'schemes', title: 'Schemes', icon: '💰', route: '/drawer/schemes' },
    { id: 'feedback', title: 'Feedback', icon: '💬', route: '/drawer/feedback' },
  ];

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  const renderSettingsCard = (option: any, index: number) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.settingsCard, { width: cardWidth }]}
      onPress={() => handleOptionPress(option.route)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{option.icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{option.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Settings Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {settingsOptions.map((option, index) => renderSettingsCard(option, index))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Catalogue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <View style={styles.activeIndicator}>
            <Text style={styles.navIconActive}>🏠</Text>
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🖨️</Text>
          <Text style={styles.navLabel}>Slip Box</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗳️</Text>
          <Text style={styles.navLabel}>Poll Day</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Active state styling
  },
  activeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  navLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
});

