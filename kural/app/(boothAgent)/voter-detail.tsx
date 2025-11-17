import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { voterAPI } from '../../services/api/voter';
import { VoterSlipTemplate } from '../../components/VoterSlipTemplate';
import { TamilHeaderForPrint } from '../../components/TamilHeaderForPrint';
import { PrintService } from '../../services/PrintService';

export default function VoterDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [voter, setVoter] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const slipRef = useRef<View>(null);
  const headerRef = useRef<View>(null); // Separate ref for Tamil header
  
  // Editable fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [pan, setPan] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [subCaste, setSubCaste] = useState('');

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
        
        // Populate editable fields
        setMobileNumber(voterData.mobile || voterData.mobileNumber || voterData['Mobile No'] || '');
        setEmail(voterData.emailid || voterData.email || '');
        setAddress(voterData.address || voterData.Address || '');
        setAadhar(voterData.aadhar || voterData.aadharNumber || '');
        setPan(voterData.PAN || voterData.panNumber || '');
        setReligion(voterData.religion || '');
        setCaste(voterData.caste || '');
        setSubCaste(voterData.subcaste || voterData.subCaste || '');
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

  const handleSave = async () => {
    try {
      const voterId = voter._id || voter.Number;
      
      if (!voterId) {
        Alert.alert('Error', 'Voter ID not found');
        return;
      }

      // Prepare update data
      const updateData = {
        mobile: mobileNumber,
        emailid: email,
        address: address,
        aadhar: aadhar,
        PAN: pan,
        religion: religion,
        caste: caste,
        subcaste: subCaste,
      };

      // Call API to update voter info
      const response = await voterAPI.updateVoterInfo(voterId, updateData);
      
      if (response?.success) {
        // Update local state
        setVoter({ 
          ...voter, 
          mobile: mobileNumber,
          emailid: email,
          address: address,
          aadhar: aadhar,
          PAN: pan,
          religion: religion,
          caste: caste,
          subcaste: subCaste
        });
        setIsEditing(false);
        Alert.alert('Success', 'Voter information updated successfully');
        
        // Reload details to get latest data
        await loadVoterDetails();
      } else {
        Alert.alert('Error', response.message || 'Failed to update voter information');
      }
    } catch (error) {
      console.error('Failed to update voter:', error);
      Alert.alert('Error', 'Failed to update voter information');
    }
  };

  const handlePrintSlip = async () => {
    try {
      setPrinting(true);

      // Check printer status first
      const status = await PrintService.checkPrinterStatus();
      
      if (!status.bluetoothEnabled) {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to print voter slips.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enable', 
              onPress: () => router.push('/(boothAgent)/slip_box')
            }
          ]
        );
        setPrinting(false);
        return;
      }

      if (!status.printerConnected) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect to a printer first. Go to Slip Box to connect.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Connect', 
              onPress: () => router.push('/(boothAgent)/slip_box')
            }
          ]
        );
        setPrinting(false);
        return;
      }

      // Prepare voter data for printing
      const voterData = {
        voterID: voter.voterID || voter['EPIC No'] || voter.Number || 'N/A',
        name: voter.name?.english || voter.Name || 'Unknown',
        nameTamil: voter.name?.tamil || '',
        fathername: voter.fathername || voter.fatherName || voter['Father Name'] || '',
        fatherNameTamil: voter.fatherNameTamil || '',
        gender: voter.gender || voter.sex || voter.Sex || voter.Gender || 'M',
        age: parseInt(voter.age || voter.Age) || 18,
        address: voter.address || voter.doorNo || '',
        boothno: voter.boothno || parseInt(voter.boothNumber || voter.PS_NO) || 1,
        serialNo: parseInt(voter.slipNo || voter['Sl.No.'] || voter.Number) || 1,
        partname: voter.partname || voter.boothName || 'N/A',
        boothNameTamil: voter.boothNameTamil || '',
      };

      // Print the voter slip with Tamil header image + text details
      // This prints: Tamil header (as image) + Voter details (as text, no duplicate)
      const success = await PrintService.printVoterSlipComplete(headerRef, voterData);
      
      if (success) {
        Alert.alert('Success', 'Voter slip printed!\n\n✓ Tamil header (image)\n✓ Voter details (text)');
      } else {
        Alert.alert('Print Failed', 'Failed to print voter slip');
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print voter slip');
    } finally {
      setPrinting(false);
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
  const isVerified = voter.verified === true || voter.status === 'verified';

  return (
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        {/* Hidden Tamil Header for printing (captured as image) */}
        <View style={{ position: 'absolute', left: 0, top: 0, opacity: 0, zIndex: -1 }}>
          <TamilHeaderForPrint ref={headerRef} />
        </View>

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
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Icon name={isEditing ? "save" : "edit"} size={24} color="#1976D2" />
            <Text style={styles.editText}>{isEditing ? "Save" : "Edit"}</Text>
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
            <Text style={styles.voterName}>
              {voter.name?.english || voter.Name || 'Unknown'}
            </Text>
            {voter.name?.tamil && (
              <Text style={styles.voterNameTamil}>
                {voter.name.tamil}
              </Text>
            )}
          </View>

          {/* Basic Info Card */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voter ID</Text>
              <Text style={styles.infoValue}>{voter.voterID || voter['EPIC No'] || voter.Number || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{voter.age || voter.Age || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{voter.gender || voter.sex || voter.Sex || voter.Gender || 'N/A'}</Text>
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
            {voter.DOB && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>{new Date(voter.DOB).toLocaleDateString()}</Text>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Mobile Number */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    placeholder="Enter mobile number"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={[styles.infoValue, styles.phoneValue]}>
                    {mobileNumber || 'N/A'}
                  </Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* Email */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{email || 'N/A'}</Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* Address */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput, styles.textArea]}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                    placeholder="Enter address"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={[styles.infoValue, { textAlign: 'left' }]}>
                    {address || 'N/A'}
                  </Text>
                )}
              </View>
            </>
          </View>

          {/* Additional Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="info" size={20} color="#1976D2" />
              <Text style={styles.cardTitle}>Additional Information</Text>
            </View>

            <View style={styles.divider} />

            {/* Aadhar Number */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Aadhar Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={aadhar}
                    onChangeText={setAadhar}
                    keyboardType="numeric"
                    maxLength={12}
                    placeholder="Enter Aadhar number"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{aadhar || 'N/A'}</Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* PAN Number */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PAN Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={pan}
                    onChangeText={(text) => setPan(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={10}
                    placeholder="Enter PAN number"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{pan || 'N/A'}</Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* Religion */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Religion</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={religion}
                    onChangeText={setReligion}
                    placeholder="Enter religion"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{religion || 'N/A'}</Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* Caste */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Caste</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={caste}
                    onChangeText={setCaste}
                    placeholder="Enter caste"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{caste || 'N/A'}</Text>
                )}
              </View>
              <View style={styles.divider} />
            </>

            {/* Sub-Caste */}
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sub-Caste</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoValue, styles.editableInput]}
                    value={subCaste}
                    onChangeText={setSubCaste}
                    placeholder="Enter sub-caste"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.infoValue}>{subCaste || 'N/A'}</Text>
                )}
              </View>
            </>
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

          {/* Hidden Voter Slip Template for Printing */}
          <View 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0,
              opacity: 0, 
              zIndex: -1 
            }} 
            ref={slipRef}
            collapsable={false}
          >
            <VoterSlipTemplate
              data={{
                voterID: voter.voterID || voter['EPIC No'] || voter.Number || 'N/A',
                name: voter.name?.english || voter.Name || 'Unknown',
                nameTamil: voter.name?.tamil || '',
                fatherName: voter.fatherName || voter['Father Name'] || '',
                fatherNameTamil: voter.fatherNameTamil || '',
                gender: voter.gender || voter.sex || voter.Sex || voter.Gender || 'M',
                age: parseInt(voter.age || voter.Age) || 18,
                doorNo: voter.doorNo || voter.address || '',
                boothNo: parseInt(voter.boothNumber || voter.PS_NO) || 1,
                serialNo: parseInt(voter.slipNo || voter['Sl.No.'] || voter.Number) || 1,
                boothName: voter.boothName || 'Booth',
                boothNameTamil: voter.boothNameTamil || '',
                partyName: voter.partyName || '',
                partyNameTamil: voter.partyNameTamil || '',
                partySymbol: voter.partySymbol || '',
                candidateName: voter.candidateName || '',
                candidateNameTamil: voter.candidateNameTamil || '',
              }}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action Buttons Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {/* Print Button - Green when verified, Gray when pending */}
            <TouchableOpacity 
              style={[
                styles.printButton, 
                !isVerified && styles.printButtonDisabledGray,
                printing && styles.printButtonDisabled
              ]}
              onPress={handlePrintSlip}
              disabled={printing || !isVerified}
            >
              {printing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="print" size={20} color="#fff" />
                  <Text style={styles.printButtonText}>
                    {isVerified ? 'Print Slip' : 'Verify to Print'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Mark as Verified Button - Only show if not verified */}
            {!isVerified && (
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
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  voterNameTamil: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
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
  editableInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  printButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  printButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  printButtonDisabledGray: {
    backgroundColor: '#9E9E9E',
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  verifyButton: {
    flex: 1,
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
});
