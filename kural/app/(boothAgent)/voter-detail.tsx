import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function VoterDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [voter, setVoter] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Contact Information
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  
  // Additional Information
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [subCaste, setSubCaste] = useState('');
  const [category, setCategory] = useState('');
  const [casteCategory, setCasteCategory] = useState('');
  const [party, setParty] = useState('');
  const [schemes, setSchemes] = useState('');
  const [history, setHistory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [language, setLanguage] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadVoterDetails = async () => {
    try {
      setLoading(true);
      const voterId = params.voterId as string;
      
      if (!voterId) {
        Alert.alert('Error', 'Voter ID is required');
        router.back();
        return;
      }

      // Fetch voter by ID or EPIC number
      let response;
      if (voterId.startsWith('_id:')) {
        const id = voterId.replace('_id:', '');
        response = await voterAPI.getVoterById(id);
      } else {
        response = await voterAPI.getVoterByEpic(voterId);
      }
      
      if (response?.success) {
        const voterData = response.data || response.voter;
        setVoter(voterData);
        
        // Populate contact information
        setMobileNumber(voterData.mobileNumber || voterData['Mobile No'] || '');
        setWhatsappNumber(voterData.whatsappNumber || '');
        setEmail(voterData.email || '');
        setLocation(voterData.location || '');
        if (voterData.dateOfBirth) {
          setDateOfBirth(new Date(voterData.dateOfBirth));
        }
        
        // Populate additional information
        setAadharNumber(voterData.aadharNumber || '');
        setPanNumber(voterData.panNumber || '');
        setMembershipNumber(voterData.membershipNumber || '');
        setReligion(voterData.religion || '');
        setCaste(voterData.caste || '');
        setSubCaste(voterData.subCaste || '');
        setCategory(voterData.category || '');
        setCasteCategory(voterData.casteCategory || '');
        setParty(voterData.party || '');
        setSchemes(voterData.schemes || '');
        setHistory(voterData.history || '');
        setFeedback(voterData.feedback || '');
        setLanguage(voterData.language || '');
        setRemarks(voterData.remarks || '');
      } else {
        Alert.alert('Error', 'Failed to load voter details');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load voter details:', error);
      Alert.alert('Error', 'Failed to load voter details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoterDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsVerified = async () => {
    try {
      setVerifying(true);
      const voterId = voter._id || voter.Number;
      
      if (!voterId) {
        Alert.alert('Error', 'Voter ID not found');
        return;
      }

      // Call API to mark voter as verified
      const response = await voterAPI.markAsVerified(voterId);
      
      if (response?.success) {
        // Update local state
        setVoter({ ...voter, verified: true, status: 'verified' });
        Alert.alert('Success', 'Voter marked as verified');
      } else {
        Alert.alert('Error', response.message || 'Failed to verify voter');
      }
    } catch (error) {
      console.error('Failed to verify voter:', error);
      Alert.alert('Error', 'Failed to verify voter');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAdditionalInfo = async () => {
    try {
      setSaving(true);
      const voterId = voter._id || voter.Number;
      
      if (!voterId) {
        Alert.alert('Error', 'Voter ID not found');
        return;
      }

      // Prepare data to save
      const additionalData = {
        // Contact Information
        dateOfBirth: dateOfBirth?.toISOString(),
        mobileNumber,
        whatsappNumber,
        email,
        location,
        // Additional Information
        aadharNumber,
        panNumber,
        membershipNumber,
        religion,
        caste,
        subCaste,
        category,
        casteCategory,
        party,
        schemes,
        history,
        feedback,
        language,
        remarks
      };

      // Call API to update voter information
      const response = await voterAPI.updateVoterInfo(voterId, additionalData);
      
      if (response?.success) {
        Alert.alert('Success', 'Voter information updated successfully');
        // Reload voter details
        await loadVoterDetails();
        // Exit edit mode
        setIsEditing(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to update voter information');
      }
    } catch (error) {
      console.error('Failed to save voter information:', error);
      Alert.alert('Error', 'Failed to save voter information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading voter details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!voter) {
    return (
      <ScreenWrapper userRole="booth_agent">
        <View style={styles.loadingContainer}>
          <Icon name="person-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Voter not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const age = parseInt(voter.age || voter.Age) || 0;
  const isSenior60 = age >= 60 && age < 80;
  const isSenior80 = age >= 80;
  const hasPhone = voter['Mobile No'] || voter.Mobile || voter['Mobile Number'];
  const isVerified = voter.verified === true || voter.status === 'verified';

  return (
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voter Details</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => {
              if (isEditing) {
                // Save the changes
                handleSaveAdditionalInfo();
              } else {
                // Enter edit mode
                setIsEditing(true);
              }
            }}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#1976D2" />
            ) : (
              <>
                <Icon name={isEditing ? "save" : "edit"} size={24} color="#1976D2" />
                <Text style={styles.editText}>{isEditing ? "Save" : "Edit"}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Verification Status Badge */}
          {isVerified ? (
            <View style={styles.statusBadge}>
              <Icon name="verified" size={24} color="#4CAF50" />
              <Text style={styles.statusText}>Verified</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.pendingStatusBadge]}>
              <Icon name="schedule" size={24} color="#FF9800" />
              <Text style={[styles.statusText, styles.pendingStatusText]}>Pending Verification</Text>
            </View>
          )}

          {/* Voter Name Card */}
          <View style={styles.card}>
            <Text style={styles.voterName}>{voter.Name || 'Unknown'}</Text>
          </View>

          {/* Basic Info Card */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voter ID</Text>
              <Text style={styles.infoValue}>{voter['EPIC No'] || voter.Number || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{voter.age || voter.Age || 'N/A'} years</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{voter.sex || voter.Sex || voter.Gender || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family ID</Text>
              <Text style={styles.infoValue}>{voter.familyId || voter.FamilyId || 'N/A'}</Text>
            </View>
          </View>

          {/* Contact Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="contacts" size={20} color="#1976D2" />
              <Text style={styles.cardTitle}>Contact Information</Text>
            </View>

            <View style={styles.divider} />

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Icon name="cake" size={18} color="#666" style={styles.inputIcon} />
              <TouchableOpacity 
                style={styles.input}
                onPress={() => isEditing && setShowDatePicker(true)}
                disabled={!isEditing}
              >
                <Text style={dateOfBirth ? styles.inputText : styles.inputPlaceholder}>
                  {dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && isEditing && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Icon name="phone" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Mobile Number"
                placeholderTextColor="#999"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            {/* WhatsApp Number */}
            <View style={styles.inputGroup}>
              <Icon name="chat" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Whatsapp Number"
                placeholderTextColor="#999"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Icon name="email" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Icon name="location-on" size={18} color="#666" style={styles.inputIcon} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="No Location"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                  editable={false}
                />
                <TouchableOpacity style={styles.fetchLocationButton}>
                  <Text style={styles.fetchLocationText}>Fetch Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Icon name="home" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter Address"
                placeholderTextColor="#999"
                value={voter.address || voter.Address || (voter.Door_No ? `Door No: ${voter.Door_No}` : '')}
                multiline
                numberOfLines={3}
                editable={false}
              />
            </View>
          </View>

          {/* Additional Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="info" size={20} color="#1976D2" />
              <Text style={styles.cardTitle}>Additional Information</Text>
            </View>

            <View style={styles.divider} />

            {/* Aadhar Number */}
            <View style={styles.inputGroup}>
              <Icon name="fingerprint" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Aadhar Number"
                placeholderTextColor="#999"
                value={aadharNumber}
                onChangeText={setAadharNumber}
                keyboardType="numeric"
                maxLength={12}
                editable={isEditing}
              />
            </View>

            {/* PAN Number */}
            <View style={styles.inputGroup}>
              <Icon name="credit-card" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Pan Number"
                placeholderTextColor="#999"
                value={panNumber}
                onChangeText={(text) => setPanNumber(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
                editable={isEditing}
              />
            </View>

            {/* Membership Number */}
            <View style={styles.inputGroup}>
              <Icon name="card-membership" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Membership Number"
                placeholderTextColor="#999"
                value={membershipNumber}
                onChangeText={setMembershipNumber}
                editable={isEditing}
              />
            </View>

            {/* Religion */}
            <View style={styles.inputGroup}>
              <Icon name="add-circle-outline" size={18} color="#666" style={styles.inputIcon} />
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  if (isEditing) {
                    Alert.alert('Select Religion', '', [
                      { text: 'Hindu', onPress: () => setReligion('Hindu') },
                      { text: 'Muslim', onPress: () => setReligion('Muslim') },
                      { text: 'Christian', onPress: () => setReligion('Christian') },
                      { text: 'Sikh', onPress: () => setReligion('Sikh') },
                      { text: 'Buddhist', onPress: () => setReligion('Buddhist') },
                      { text: 'Jain', onPress: () => setReligion('Jain') },
                      { text: 'Other', onPress: () => setReligion('Other') },
                      { text: 'Cancel', style: 'cancel' }
                    ]);
                  }
                }}
                disabled={!isEditing}
              >
                <Text style={religion ? styles.inputText : styles.inputPlaceholder}>
                  {religion || 'Select Religion'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Caste */}
            <View style={styles.inputGroup}>
              <Icon name="people-outline" size={18} color="#666" style={styles.inputIcon} />
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  if (isEditing) {
                    Alert.alert('Select Caste', '', [
                      { text: 'General', onPress: () => setCaste('General') },
                      { text: 'OBC', onPress: () => setCaste('OBC') },
                      { text: 'SC', onPress: () => setCaste('SC') },
                      { text: 'ST', onPress: () => setCaste('ST') },
                      { text: 'Other', onPress: () => setCaste('Other') },
                      { text: 'Cancel', style: 'cancel' }
                    ]);
                  }
                }}
                disabled={!isEditing}
              >
                <Text style={caste ? styles.inputText : styles.inputPlaceholder}>
                  {caste || 'Select Caste'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-Caste */}
            <View style={styles.inputGroup}>
              <Icon name="add-circle-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Sub-Caste"
                placeholderTextColor="#999"
                value={subCaste}
                onChangeText={setSubCaste}
                editable={isEditing}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Icon name="category" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Category"
                placeholderTextColor="#999"
                value={category}
                onChangeText={setCategory}
                editable={isEditing}
              />
            </View>

            {/* Caste Category */}
            <View style={styles.inputGroup}>
              <Icon name="people-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Caste Category"
                placeholderTextColor="#999"
                value={casteCategory}
                onChangeText={setCasteCategory}
                editable={isEditing}
              />
            </View>

            {/* Party */}
            <View style={styles.inputGroup}>
              <Icon name="flag" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Party"
                placeholderTextColor="#999"
                value={party}
                onChangeText={setParty}
                editable={isEditing}
              />
            </View>

            {/* Schemes */}
            <View style={styles.inputGroup}>
              <Icon name="loyalty" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Schemes"
                placeholderTextColor="#999"
                value={schemes}
                onChangeText={setSchemes}
                editable={isEditing}
              />
            </View>

            {/* History */}
            <View style={styles.inputGroup}>
              <Icon name="history" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select History"
                placeholderTextColor="#999"
                value={history}
                onChangeText={setHistory}
                editable={isEditing}
              />
            </View>

            {/* Feedback */}
            <View style={styles.inputGroup}>
              <Icon name="feedback" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Feedback"
                placeholderTextColor="#999"
                value={feedback}
                onChangeText={setFeedback}
                editable={isEditing}
              />
            </View>

            {/* Language */}
            <View style={styles.inputGroup}>
              <Icon name="language" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select Language"
                placeholderTextColor="#999"
                value={language}
                onChangeText={setLanguage}
                editable={isEditing}
              />
            </View>

            {/* Remarks */}
            <View style={styles.inputGroup}>
              <Icon name="comment" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter Remarks"
                placeholderTextColor="#999"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Special Categories */}
          {(isSenior60 || isSenior80 || (voter.specialCategories && voter.specialCategories.length > 0)) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Special Categories</Text>
              
              <View style={styles.divider} />

              <View style={styles.tagsContainer}>
                {isSenior60 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Age 60+</Text>
                  </View>
                )}
                {isSenior80 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Age 80+</Text>
                  </View>
                )}
                {voter.specialCategories?.map((category: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Family Details Card - Optional for future implementation */}
          {voter.familyId && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                // TODO: Navigate to family details
                Alert.alert('Coming Soon', 'Family details will be available soon');
              }}
            >
              <Text style={styles.actionCardText}>View Family Details</Text>
              <Icon name="chevron-right" size={24} color="#1976D2" />
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Mark as Verified Button */}
        {!isVerified && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
              onPress={handleMarkAsVerified}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.verifyButtonText}>Mark as Verified</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  editText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  pendingStatusBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pendingStatusText: {
    color: '#FF9800',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 0,
    minWidth: 100,
    marginRight: 16,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  phoneValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionCardText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  fetchLocationButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  fetchLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
