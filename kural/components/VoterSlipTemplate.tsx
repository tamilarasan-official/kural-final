/**
 * Voter Slip Template Component
 * Renders a printable voter slip matching the thermal printer format
 * Width: 384 dots (58mm thermal paper)
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export interface VoterSlipData {
  // Voter Details
  voterID: string;
  name: string;
  nameTamil?: string;
  fatherName: string;
  fatherNameTamil?: string;
  gender: string;
  age: number;
  doorNo: string;
  
  // Booth Details
  boothNo: number;
  serialNo: number;
  boothName: string;
  boothNameTamil?: string;
  
  // Election Details
  electionYear?: string;
  electionTitle?: string; // Tamil header
  
  // Party Details (optional - for candidate info)
  partyName?: string;
  partyNameTamil?: string;
  partySymbol?: string; // Base64 or URL
  candidateName?: string;
  candidateNameTamil?: string;
  candidatePhoto?: string; // Base64 or URL
  
  // Additional Info
  slipNumbers?: number[]; // [1, 2, 3, 4, 9] etc.
  printedDate?: Date;
}

interface VoterSlipTemplateProps {
  data: VoterSlipData;
  showPartyInfo?: boolean;
}

export const VoterSlipTemplate: React.FC<VoterSlipTemplateProps> = ({ 
  data, 
  showPartyInfo = false 
}) => {
  const formatPrintDate = (date?: Date) => {
    if (!date) date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}pm`;
  };

  return (
    <View style={styles.slipContainer}>
      {/* Tamil Header */}
      <Text style={styles.headerTamil}>
        {data.electionTitle || 'தமிழ்நாடு சட்டமன்ற தேர்தல் 2026'}
      </Text>

      {/* Slip Numbers */}
      {data.slipNumbers && data.slipNumbers.length > 0 && (
        <View style={styles.slipNumbersContainer}>
          {data.slipNumbers.map((num, idx) => (
            <Text key={idx} style={styles.slipNumber}>{num}</Text>
          ))}
        </View>
      )}

      {/* Party Information (Optional) */}
      {showPartyInfo && (
        <View style={styles.partySection}>
          {/* Candidate Photos/Party Symbol Row */}
          <View style={styles.symbolRow}>
            {data.candidatePhoto && (
              <Image 
                source={{ uri: data.candidatePhoto }} 
                style={styles.candidatePhoto}
                resizeMode="contain"
              />
            )}
            {data.partySymbol && (
              <Image 
                source={{ uri: data.partySymbol }} 
                style={styles.partySymbol}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Party Name in Tamil */}
          {data.partyNameTamil && (
            <Text style={styles.partyNameTamil}>{data.partyNameTamil}</Text>
          )}

          {/* Candidate Name in Tamil */}
          {data.candidateNameTamil && (
            <Text style={styles.candidateNameTamil}>{data.candidateNameTamil}</Text>
          )}

          {/* Additional Tamil Text Lines */}
          <Text style={styles.additionalTamil}>144. தொண்டாமுதூர் சட்டமன்றம்</Text>
          <Text style={styles.additionalTamil}>சட்ட மன்ற வேட்பாளர்</Text>
        </View>
      )}

      {/* Additional Tamil Content */}
      <Text style={styles.additionalInfo}>
        {`வரிசை எண்: ${data.serialNo}  வாக்காளர் அட்டை எண்:`}
      </Text>
      <Text style={styles.dateLineTamil}>06-ஜனவரி-2025</Text>
      <Text style={styles.instructionTamil}>
        2.கிளர்ச்சி வாங்குதல் 2.இந்த காகிதத்தைப்பிரதனத்துள
      </Text>

      {/* Cut Line */}
      <View style={styles.cutLineContainer}>
        <View style={styles.cutLineDash} />
        <Text style={styles.cutLineText}>Please Cut Here</Text>
        <View style={styles.cutLineDash} />
      </View>

      {/* English Section */}
      <View style={styles.englishSection}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Booth No:</Text>
          <Text style={styles.value}>{data.boothNo}</Text>
          <Text style={styles.label}>  Serial No:</Text>
          <Text style={styles.value}>{data.serialNo}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Booth Name</Text>
        </View>
        <Text style={styles.valueMultiline}>
          {data.boothName}
          {data.boothNameTamil && `\n${data.boothNameTamil}`}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Voter ID -</Text>
          <Text style={styles.value}>{data.voterID}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Name -</Text>
          <Text style={styles.value}>{data.name}</Text>
        </View>
        {data.nameTamil && (
          <Text style={styles.tamilValue}>    {data.nameTamil}</Text>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Father -</Text>
          <Text style={styles.value}>{data.fatherName}</Text>
        </View>
        {data.fatherNameTamil && (
          <Text style={styles.tamilValue}>    {data.fatherNameTamil}</Text>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Gender -</Text>
          <Text style={styles.value}>{data.gender}</Text>
          <Text style={styles.label}>  | Age -</Text>
          <Text style={styles.value}>{data.age}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Door No -</Text>
          <Text style={styles.value}>{data.doorNo}</Text>
        </View>
      </View>

      {/* Print Timestamp */}
      <Text style={styles.timestamp}>
        Printed on {formatPrintDate(data.printedDate)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slipContainer: {
    width: 384, // 58mm = 384 dots at 203 DPI
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
  },
  headerTamil: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
    letterSpacing: 0.5,
  },
  slipNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  slipNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 4,
  },
  partySection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  candidatePhoto: {
    width: 60,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  partySymbol: {
    width: 60,
    height: 60,
  },
  partyNameTamil: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000',
  },
  candidateNameTamil: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000',
  },
  additionalTamil: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
    color: '#000000',
  },
  additionalInfo: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000',
  },
  dateLineTamil: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000',
  },
  instructionTamil: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
  },
  cutLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  cutLineDash: {
    flex: 1,
    height: 1,
    backgroundColor: '#999999',
    borderStyle: 'dashed',
  },
  cutLineText: {
    fontSize: 9,
    color: '#666666',
    marginHorizontal: 8,
    fontStyle: 'italic',
  },
  englishSection: {
    width: '100%',
    alignItems: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '600',
  },
  value: {
    fontSize: 10,
    color: '#000000',
    marginLeft: 4,
  },
  valueMultiline: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 6,
    marginLeft: 4,
  },
  tamilValue: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 4,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default VoterSlipTemplate;
