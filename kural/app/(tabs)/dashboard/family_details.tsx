import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../../components/HeaderBack';
import { useLanguage } from '../../../contexts/LanguageContext';
import { voterAPI } from '../../../services/api/voter';

export default function FamilyDetailsScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { partNumber, familyKey } = useLocalSearchParams();
  const [voters, setVoters] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!partNumber) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      let list: any[] = [];
      try {
        const res = await voterAPI.getVotersByBooth(partNumber as string, { page: 1, limit: 1000 });
        if (Array.isArray(res?.voters)) list = res.voters;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res)) list = res as any[];
      } catch {}
      // Fallback
      if (!list.length) {
        try {
          const s = await voterAPI.searchVoters({ partNo: String(partNumber), page: 1, limit: 1000 });
          if (Array.isArray(s?.data)) list = s.data as any[];
          else if (Array.isArray(s?.voters)) list = s.voters as any[];
          else if (Array.isArray(s)) list = s as any[];
        } catch { list = []; }
      }
      // Filter by familyKey (Door_No)
      setVoters(list.filter(v => String(v.Door_No ?? 'Unknown') === String(familyKey)));
      setLoading(false);
    })();
  }, [partNumber, familyKey]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBack onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{`Part ${partNumber} - Family`}</Text>
        <View style={{ width: 32 }} />
      </View>
      <Text style={styles.totalVoters}>{t('dashboard.totalVoters')}: {voters.length}</Text>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>{t('dashboard.loadingFamilies')}</Text>
        ) : (
          voters.map((voter) => (
            <TouchableOpacity
              key={voter._id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/(tabs)/dashboard/voter_info', params: { voterData: JSON.stringify(voter) } })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.serial}>{t('dashboard.serial')} : {voter.sr ?? '-'}</Text>
                <Text style={styles.section}>{t('dashboard.section')} : {voter.Part_no ?? '-'}</Text>
                <Text style={styles.part}>{t('dashboard.part')} : {voter.Part_no ?? '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.imageWrap}>
                  <Icon name="image" size={32} color="#90A4AE" />
                  <Text style={styles.epic}>{voter.Number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{voter.Name}</Text>
                  {/* Tamil name and father name can be added here if available */}
                  <Text style={styles.father}>{voter['Father Name']}</Text>
                  <Text style={styles.door}>{t('dashboard.doorNo')} {voter.Door_No}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Icon name="person" size={16} color="#E91E63" />
                    <Text style={styles.ageSex}>{voter.age ?? '-'} | {voter.sex ?? '-'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#E3F2FD', paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  headerTitle: { color: '#000', fontSize: 20, fontWeight: '700' },
  totalVoters: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#E0E0E0' },
  serial: { color: '#1565C0', fontWeight: '700', fontSize: 16 },
  section: { color: '#1565C0', fontWeight: '700', fontSize: 16, marginLeft: 16 },
  part: { color: '#1565C0', fontWeight: '700', fontSize: 16, marginLeft: 16 },
  imageWrap: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  epic: { backgroundColor: '#1976D2', color: '#fff', fontWeight: '700', fontSize: 13, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  father: { fontSize: 14, color: '#374151' },
  door: { fontSize: 13, color: '#6B7280' },
  ageSex: { marginLeft: 6, color: '#374151', fontSize: 14 },
});
