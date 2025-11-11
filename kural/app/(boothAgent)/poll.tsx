import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBack from '../components/HeaderBack';
import { voterAPI } from '../../services/api/voter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { useRole } from '../contexts/RoleContext';

export default function PollScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userData } = useRole();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [serials, setSerials] = useState<number[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<{ total: number; voted: number; notVoted: number }>({ total: 0, voted: 0, notVoted: 0 });
  const [mode, setMode] = useState<'all'|'voted'|'not'>('all');
  const [hydrated, setHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');

  useEffect(() => {
    const boothId = userData?.booth_id;
    if (!boothId) return;
    
    (async () => {
      try {
        setLoading(true);
        setHydrated(false);
        
        // Load voters by booth ID instead of part number
        const res = await voterAPI.getVotersByBoothId(boothId, { page: 1, limit: 5000 });
        const items = Array.isArray(res?.voters) ? res.voters : [];
        
        const srs = items.map((it: any) => Number(it.sr || it.serial || it.Serial || it.serialNo)).filter((n: any) => Number.isFinite(n));
        const sorted = [...srs].sort((a: number, b: number) => a - b);
        
        setSerials(sorted);
        
        // Sort voters by serial number
        const bySerial = [...items].sort((a: any, b: any) => {
          const as = Number(a.sr || a.serial || a.Serial || a.serialNo || 0);
          const bs = Number(b.sr || b.serial || b.Serial || b.serialNo || 0);
          return as - bs;
        });
        setVoters(bySerial);
        
        // Set total stats
        const total = res.pagination?.totalVoters || items.length;
        setStats({ total, voted: 0, notVoted: total });
        
        if (total > 0 && sorted.length === 0) {
          // If no serial numbers, create a numbered list
          setSerials(Array.from({ length: total }, (_, i) => i + 1));
        }
        
        // Load persisted voted set for this booth
        try {
          const saved = await AsyncStorage.getItem(`poll_voted_booth_${boothId}`);
          if (saved) {
            const arr = (JSON.parse(saved) as any[]).map((n) => Number(n)).filter((n) => Number.isFinite(n));
            const s = new Set<number>(arr);
            setVoted(s);
          } else {
            setVoted(new Set());
          }
        } catch { 
          setVoted(new Set()); 
        }
        
        // Load favorites for this booth
        try {
          const fav = await AsyncStorage.getItem(`poll_fav_booth_${boothId}`);
          if (fav) {
            const arr = (JSON.parse(fav) as any[]).map((n) => Number(n)).filter((n) => Number.isFinite(n));
            setFavorites(new Set<number>(arr));
          } else {
            setFavorites(new Set());
          }
        } catch { 
          setFavorites(new Set()); 
        }
        
        setHydrated(true);
      } catch (error) {
        console.error('Error loading booth voters:', error);
        const t = voters?.length || 0;
        setStats({ total: t, voted: 0, notVoted: t });
        if (t > 0) setSerials(Array.from({ length: t }, (_, i) => i + 1));
        setVoted(new Set());
        setFavorites(new Set());
        setHydrated(true);
      } finally { 
        setLoading(false); 
      }
    })();
  }, [userData?.booth_id]);

  // persist voted changes
  useEffect(() => {
    const boothId = userData?.booth_id;
    if (!boothId || !hydrated) return;
    (async () => {
      try {
        await AsyncStorage.setItem(`poll_voted_booth_${boothId}`, JSON.stringify(Array.from(voted)));
      } catch {}
    })();
  }, [voted, userData?.booth_id, hydrated]);

  // persist favorites
  useEffect(() => {
    const boothId = userData?.booth_id;
    if (!boothId || !hydrated) return;
    (async () => {
      try {
        await AsyncStorage.setItem(`poll_fav_booth_${boothId}`, JSON.stringify(Array.from(favorites)));
      } catch {}
    })();
  }, [favorites, userData?.booth_id, hydrated]);
  
  // Booth agents always see their voters - no part selection needed
  const total = stats.total || serials.length;
  const votedCount = voted.size;
  const notVoted = Math.max(0, total - votedCount);
  
  return (
    <ScreenWrapper userRole="booth_agent">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(boothAgent)/dashboard')}>
            <HeaderBack onPress={() => router.push('/(boothAgent)/dashboard')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('poll.pollDay')} - {userData?.booth_id || ''}</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <Icon name={viewMode === 'grid' ? 'list' : 'grid-view'} size={22} color="#1976D2" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#90A4AE" />
            <TextInput 
              style={styles.searchInput} 
              placeholder={t('poll.voterIdOrName')} 
              placeholderTextColor="#9AA5B1"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        <View style={styles.statRow}>
          <TouchableOpacity onPress={() => setMode('voted')} style={[styles.statCard, { backgroundColor: '#C8E6C9' }, mode==='voted' && styles.statActive]}> 
            <Text style={styles.statTitle}>{t('poll.voted')}</Text>
            <Text style={styles.statValue}>{votedCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('not')} style={[styles.statCard, { backgroundColor: '#F8BBD0' }, mode==='not' && styles.statActive]}> 
            <Text style={styles.statTitle}>{t('poll.notVoted')}</Text>
            <Text style={styles.statValue}>{notVoted}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('all')} style={[styles.statCard, { backgroundColor: '#BBDEFB' }, mode==='all' && styles.statActive]}> 
            <Text style={styles.statTitle}>{t('poll.total')}</Text>
            <Text style={styles.statValue}>{total}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flexGrow: 0, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : viewMode === 'grid' ? (
          <ScrollView contentContainerStyle={styles.serialGrid}>
              {serials.filter(s => mode==='all' ? true : (mode==='voted' ? voted.has(s) : !voted.has(s))).map((s, i) => {
                const isVoted = voted.has(s);
                return (
                  <TouchableOpacity
                    key={`${s}-${i}`}
                    onPress={() => {
                      const next = new Set(voted);
                      if (next.has(s)) {
                        next.delete(s);
                      } else {
                        next.add(s);
                      }
                      setVoted(next);
                    }}
                    style={[styles.serialPill, isVoted ? styles.serialPillVoted : styles.serialPillNot]}
                  >
                    <Text style={[styles.serialText, { color: isVoted ? '#0E5E2F' : '#7A1D1D' }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.listWrap}>
              {voters
                .filter((it: any) => {
                  const s = Number(it.sr || it.serial || it.Serial || it.serialNo || 0);
                  const name = String(it.Name || it.name || '').toLowerCase();
                  const q = query.trim().toLowerCase();
                  const showByMode = mode==='all' ? true : (mode==='voted' ? voted.has(s) : !voted.has(s));
                  if (!showByMode) return false;
                  if (!q) return true;
                  return String(s).includes(q) || name.includes(q);
                })
                .map((it: any, idx: number) => {
                  const s = Number(it.sr || it.serial || it.Serial || it.serialNo || 0);
                  const isVoted = voted.has(s);
                  const door = it.Door_No || it.DoorNo || it.Door || '';
                  const gender = it.Gender || it.gender || '';
                  const age = it.Age || it.age || '';
                  const tamil = it.Name_Tamil || it.nameTamil || '';
                  const relation = it.Relation || it.RelationShip || it.relation || it.Relation_type || '';
                  const epic = it.EPIC_NO || it.Epic || it.EPIC || it.Voter_ID || it.voterId || it.EPIC_NO_NEW || it.RIV || it.RIVNo || it.riv || '';
                  const img = it.photoUrl || it.image || null;
                  return (
                    <View key={`${s}-${idx}`} style={styles.voterCard}>
                      <View style={styles.serialRow}>
                        <TouchableOpacity
                          onPress={() => {
                            const next = new Set(favorites);
                            if (next.has(s)) {
                              next.delete(s);
                            } else {
                              next.add(s);
                            }
                            setFavorites(next);
                          }}
                          style={styles.starBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Icon name={favorites.has(s) ? 'star' : 'star-border'} size={18} color="#FF4081" />
                        </TouchableOpacity>
                        <Text style={styles.serialLabel}>{`${t('poll.serialNo')}: ${s}`}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.voterAvatar}>
                          {img ? <Image source={{ uri: img }} style={{ width: '100%', height: '100%', borderRadius: 8 }} /> : (
                            <Icon name="image" size={22} color="#90A4AE" />
                          )}
                          {!!epic && (
                            <View style={styles.epicPill}>
                              <Text style={styles.epicText} numberOfLines={1}>{String(epic)}</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.voterName} numberOfLines={1}>{String(it.Name || it.name || '')}</Text>
                          {tamil ? <Text style={styles.voterNameTamil} numberOfLines={2}>{tamil}</Text> : null}
                          <Text style={styles.voterMeta}>{`${t('poll.doorNo')} ${door}`}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Icon name={gender?.toLowerCase() === 'female' ? 'female' : (gender?.toLowerCase() === 'male' ? 'male' : 'person')} size={14} color="#F06292" />
                            <Text style={[styles.voterMeta, { marginLeft: 6, flexShrink: 1 }]}>{age ? `${age}` : ''}{age ? '   ' : ''}{relation ? relation : ''}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            const next = new Set(voted);
                            if (next.has(s)) {
                              next.delete(s);
                            } else {
                              next.add(s);
                            }
                            setVoted(next);
                          }}
                          style={[styles.voteToggle, isVoted ? styles.voteOn : styles.voteOff]}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.voteDot, isVoted ? styles.voteDotOn : styles.voteDotOff]} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.cardDivider} />
                    </View>
                  );
                })}
            </ScrollView>
          )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contentContainer: { flex: 1 },
  header: { backgroundColor: '#E3F2FD', paddingTop: 12, paddingBottom: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBtn: { width: 40, height: 40, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 2 },
  searchInput: { marginLeft: 8, flex: 1, color: '#000' },
  grid: { 
    paddingHorizontal: 16, 
    paddingTop: 8,
  },
  card: { 
    width: '23%', 
    aspectRatio: 1, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#90CAF9', 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardText: { color: '#1565C0', fontSize: 18, fontWeight: '800' },
  statRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },  
  statCard: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  statTitle: { color: '#111', fontWeight: '700' },
  statValue: { color: '#000', fontWeight: '900', fontSize: 16 },
  statActive: { borderWidth: 1, borderColor: '#1976D2' },
  serialGrid: { 
    paddingHorizontal: 12, 
    paddingTop: 8,
    paddingBottom: 12, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    flexGrow: 1
  },
  serialPill: { 
    width: '23%', 
    borderRadius: 28, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  serialPillVoted: { backgroundColor: '#DFF5E1', borderWidth: 1, borderColor: '#A7E3B0' },
  serialPillNot: { backgroundColor: '#FFE0E0', borderWidth: 1, borderColor: '#FFBDBD' },
  serialText: { fontWeight: '800' },
  listWrap: { 
    paddingHorizontal: 12, 
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1
  },
  voterCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginHorizontal: 4, marginTop: 12, elevation: 1 },
  serialLabel: { color: '#1976D2', fontWeight: '700', marginBottom: 8 },
  serialRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  starBtn: { marginRight: 8 },
  voterAvatar: { width: 64, height: 48, borderRadius: 8, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' },
  epicPill: { position: 'absolute', left: 6, bottom: -10, backgroundColor: '#0D47A1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  epicText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  voterName: { color: '#111', fontWeight: '700' },
  voterNameTamil: { color: '#111', marginTop: 2 },
  voterMeta: { color: '#546E7A', marginTop: 2 },
  voteToggle: { width: 40, height: 24, borderRadius: 12, marginLeft: 8, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 4 },
  voteOn: { backgroundColor: '#C8E6C9', justifyContent: 'flex-end' },
  voteOff: { backgroundColor: '#FFCDD2', justifyContent: 'flex-start' },
  voteDot: { width: 16, height: 16, borderRadius: 8 },
  voteDotOn: { backgroundColor: '#2E7D32' },
  voteDotOff: { backgroundColor: '#C62828' },
  cardDivider: { height: 1, backgroundColor: '#ECEFF1', marginTop: 12 },
});