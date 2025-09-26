import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function YourElectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Elections</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Election Card */}
        <View style={styles.electionCard}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          </View>
          
          {/* Card Details */}
          <View style={styles.cardDetails}>
            <Text style={styles.constituencyNumber}>119 -</Text>
            <Text style={styles.constituencyName}>Thondamuthur</Text>
            <Text style={styles.bodyText}>Body not</Text>
            <Text style={styles.stateText}>Tamil Nadu</Text>
          </View>
        </View>

        {/* Additional Election Cards (if any) */}
        <View style={styles.electionCard}>
          <View style={styles.imageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          </View>
          
          <View style={styles.cardDetails}>
            <Text style={styles.constituencyNumber}>120 -</Text>
            <Text style={styles.constituencyName}>Coimbatore North</Text>
            <Text style={styles.bodyText}>Assembly</Text>
            <Text style={styles.stateText}>Tamil Nadu</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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
    color: '#1976D2',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  profileIcon: {
    fontSize: 60,
    color: '#666666',
  },
  cardDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  constituencyNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  constituencyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  stateText: {
    fontSize: 14,
    color: '#666666',
  },
});


