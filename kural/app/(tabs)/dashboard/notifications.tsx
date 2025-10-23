import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

const sampleNotifications = [
  { id: '1', title: 'Welcome', body: 'Welcome to the Kural Application.' },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Text style={styles.cardBody}>{item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={22} color="#0D47A1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {/* right icon removed per design request */}
        </View>
      </View>

      <FlatList
        data={sampleNotifications}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { fontSize: 22, fontWeight: '700', padding: 16, color: '#1A237E' },
  headerWrap: { backgroundColor: '#E8F3FF', paddingTop: 8, paddingBottom: 4, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 18, color: '#0D47A1' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#0D47A1' },
  welcome: { fontSize: 14, color: '#424242', paddingHorizontal: 16, marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0D47A1' },
  cardTime: { fontSize: 12, color: '#90A4AE' },
  cardBody: { fontSize: 14, color: '#424242', lineHeight: 20 },
});
