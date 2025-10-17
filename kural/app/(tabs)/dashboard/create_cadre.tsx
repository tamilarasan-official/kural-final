import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cadreAPI } from '../../../services/api/cadre';

const { width } = Dimensions.get('window');

export default function CreateCadreScreen() {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    // Personal Details
    activeElection: '119 - Thondamuthur',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    gender: '',
    password: '',
    
    // Role and Allocation
    role: '',
    boothAllocation: '',
    status: 'Active',
    email: '',
    
    // Address Details
    street: '',
    city: '',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '',
    remarks: '',
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBoothModal, setShowBoothModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const roles = ['Booth Agent', 'Polling Officer', 'Supervisor', 'Coordinator'];
  const booths = ['Booth 1', 'Booth 2', 'Booth 3', 'Booth 4', 'Booth 5'];
  const statuses = ['Active', 'Inactive', 'Pending'];
  const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['firstName', 'mobileNumber', 'gender', 'password', 'role', 'boothAllocation', 'status', 'state'];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      Alert.alert(t('common.error'), t('cadre.fillRequiredFields'));
      return;
    }

    // Submit form
    try {
      setSaving(true);
      const response = await cadreAPI.create(formData);
      
      if (response.success) {
        Alert.alert(t('common.success'), t('cadre.createdSuccessfully'), [
          { text: t('common.ok'), onPress: () => { try { router.back(); } catch { router.replace('/(tabs)/' as any); } } }
        ]);
      } else {
        Alert.alert(t('common.error'), response.message || t('cadre.failedToCreate'));
      }
    } catch (error: any) {
      console.error('Error creating cadre:', error);
      Alert.alert(t('common.error'), error.message || t('cadre.failedToCreate'));
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Personal Details Section */}
      <Text style={styles.sectionTitle}>{t('cadre.personalDetails')}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.activeElection')}</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={formData.activeElection}
          editable={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.firstName')} *</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.firstName')}
          placeholderTextColor="#999999"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.lastName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.lastName')}
          placeholderTextColor="#999999"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.mobileNumber')} *</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.mobileNumber')}
          placeholderTextColor="#999999"
          value={formData.mobileNumber}
          onChangeText={(value) => handleInputChange('mobileNumber', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.gender')} *</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderOption,
                formData.gender === gender && styles.selectedGenderOption
              ]}
              onPress={() => handleInputChange('gender', gender)}
            >
              <View style={[
                styles.checkbox,
                formData.gender === gender && styles.checkedCheckbox
              ]}>
                {formData.gender === gender && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.genderText,
                formData.gender === gender && styles.selectedGenderText
              ]}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.password')} *</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.password')}
          placeholderTextColor="#999999"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
        />
      </View>

      {/* Role and Allocation Section */}
      <Text style={styles.sectionTitle}>{t('cadre.roleAndAllocation')}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.role')} *</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowRoleModal(true)}
        >
          <Text style={[styles.dropdownText, !formData.role && styles.placeholderText]}>
            {formData.role || t('cadre.selectRole')}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.boothAllocation')} *</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowBoothModal(true)}
        >
          <Text style={[styles.dropdownText, !formData.boothAllocation && styles.placeholderText]}>
            {formData.boothAllocation || t('cadre.selectBooth')}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.status')} *</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={[styles.dropdownText, !formData.status && styles.placeholderText]}>
            {formData.status || 'Active'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.email')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.email')}
          placeholderTextColor="#999999"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
        />
      </View>

      {/* Address Details Section */}
      <Text style={styles.sectionTitle}>{t('cadre.addressDetails')}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.street')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.street')}
          placeholderTextColor="#999999"
          value={formData.street}
          onChangeText={(value) => handleInputChange('street', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.city')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.city')}
          placeholderTextColor="#999999"
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.state')} *</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowStateModal(true)}
        >
          <Text style={[styles.dropdownText, !formData.state && styles.placeholderText]}>
            {formData.state || 'Tamil Nadu'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.country')}</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={formData.country}
          editable={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.postalCode')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('cadre.postalCode')}
          placeholderTextColor="#999999"
          value={formData.postalCode}
          onChangeText={(value) => handleInputChange('postalCode', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cadre.remarks')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('cadre.remarks')}
          placeholderTextColor="#999999"
          value={formData.remarks}
          onChangeText={(value) => handleInputChange('remarks', value)}
          multiline
          numberOfLines={3}
        />
      </View>
    </ScrollView>
  );

  const renderDropdownModal = (title: string, options: string[], field: string, visible: boolean, onClose: () => void) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => {
                  handleInputChange(field, option);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
                {formData[field as keyof typeof formData] === option && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>3:50</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}>Vo1 4.4 LTE2 KB/s</Text>
          <Text style={styles.statusText}>5G+</Text>
          <Text style={styles.batteryText}>46%</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { try { router.back(); } catch { router.replace('/(tabs)/' as any); } }}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cadre.createCadre')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form Content */}
      {renderForm()}

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('cadre.saveAndContinue')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdown Modals */}
      {renderDropdownModal(t('cadre.selectRole'), roles, 'role', showRoleModal, () => setShowRoleModal(false))}
      {renderDropdownModal(t('cadre.selectBooth'), booths, 'boothAllocation', showBoothModal, () => setShowBoothModal(false))}
      {renderDropdownModal(t('cadre.selectStatus'), statuses, 'status', showStatusModal, () => setShowStatusModal(false))}
      {renderDropdownModal(t('cadre.selectState'), states, 'state', showStateModal, () => setShowStateModal(false))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#000000',
  },
  batteryText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  readOnlyInput: {
    backgroundColor: '#E0E0E0',
    color: '#666666',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedGenderOption: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    borderColor: '#1976D2',
    backgroundColor: '#1976D2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  genderText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedGenderText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666666',
  },
  modalContent: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
  },
});
