import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface TamilHeaderProps {
  logoSource?: any;
  constituencyName?: string;
  electionDate?: string;
}

/**
 * Tamil Header Component for Printing
 * This component is captured as an image and printed at the top of voter slips
 * Matches the format shown in user's reference image
 */
export const TamilHeaderForPrint = React.forwardRef<View, TamilHeaderProps>(
  (props, ref) => {
    const { logoSource, constituencyName, electionDate } = props;
    
    return (
      <View ref={ref} style={styles.container}>
        {/* Top section with title */}
        <Text style={styles.mainTitle}>தமிழ்நாடு சட்டமன்றத் தேர்தல் 2026</Text>
        
        {/* Photos row (if available) */}
        {logoSource && (
          <View style={styles.photoRow}>
            <Image source={logoSource} style={styles.photo} resizeMode="contain" />
            <Image source={logoSource} style={styles.photo} resizeMode="contain" />
            <Image source={logoSource} style={styles.photo} resizeMode="contain" />
          </View>
        )}
        
        {/* Organization info */}
        <Text style={styles.orgText}>இடைக்கால நாடாளுமன்றச் சாமுகம்</Text>
        <Text style={styles.officerText}>அரசு தேர்தல் அதிகாரி</Text>
        
        {/* Election date and constituency */}
        <Text style={styles.dateText}>தேர்தல் - {electionDate || 'டிசம்பர் - 2026'}</Text>
        <Text style={styles.constituencyText}>
          {constituencyName || 'கோவை - தொண்டாமுத்தூர் சட்டமன்றத் தொகுதி'}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 384, // 58mm paper width in pixels
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  orgText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 3,
  },
  officerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 3,
  },
  constituencyText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#000000',
  },
});

TamilHeaderForPrint.displayName = 'TamilHeaderForPrint';
