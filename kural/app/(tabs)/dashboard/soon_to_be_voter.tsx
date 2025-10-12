import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { soonVoterAPI, SoonVoterPayload } from '../../../services/api/soonVoter';
import { settingsAPI } from '../../../services/api/settings';

export const options = { headerShown: false };

const { width } = Dimensions.get('window');

const AgeLabel = ({ oneMarkerValue }: any) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ color: '#1976D2', fontWeight: '600' }}>Age {oneMarkerValue}</Text>
  </View>
);

export default function SoonToBeVoterScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(120);
  const [genderFilter, setGenderFilter] = useState<Set<string>>(new Set());
  const [histories, setHistories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Set<string>>(new Set());
  const [selectedParty, setSelectedParty] = useState<Set<string>>(new Set());
  const [selectedReligion, setSelectedReligion] = useState<Set<string>>(new Set());
  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const [form, setForm] = useState<SoonVoterPayload>({ part: 0, gender: undefined });
  const [geoFetching, setGeoFetching] = useState(false);

  const load = async () => {
    try {
      const res = await soonVoterAPI.list({ q: query, page: 1, limit: 50 });
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      // Swallow listing errors so the screen opens even if backend route isn't ready
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  // Live counters derived from loaded items
  const stats = useMemo(() => {
    const male = items.filter((i:any) => String(i.gender || '').toLowerCase() === 'male').length;
    const female = items.filter((i:any) => String(i.gender || '').toLowerCase() === 'female').length;
    const other = items.filter((i:any) => {
      const g = String(i.gender || '').toLowerCase();
      return g && g !== 'male' && g !== 'female';
    }).length;
    return { male, female, other, total: items.length };
  }, [items]);

  useEffect(() => {
    (async () => {
      try {
        const [hist, cats, prts, rels] = await Promise.all([
          settingsAPI.getHistories?.() || Promise.resolve({ data: [] }),
          settingsAPI.getCategories() || Promise.resolve({ data: [] }),
          settingsAPI.getParties() || Promise.resolve({ data: [] }),
          settingsAPI.getReligions() || Promise.resolve({ data: [] }),
        ]);
        setHistories(Array.isArray(hist?.data) ? hist.data : (hist?.data ? hist.data : (hist?.items || hist) || []));
        setCategories(Array.isArray(cats?.data) ? cats.data : (cats?.items || cats) || []);
        setParties(Array.isArray(prts?.data) ? prts.data : (prts?.items || prts) || []);
        setReligions(Array.isArray(rels?.data) ? rels.data : (rels?.items || rels) || []);
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('soonVoter.title')}</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setFiltersVisible(true)}>
          <Icon name="tune" size={22} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      {/* Counters */}
      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { backgroundColor: '#C8E6C9' }]}>
          <Text style={styles.counterTitle}>{t('common.male')}</Text>
          <Text style={styles.counterValue}>{stats.male}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#F8BBD9' }]}>
          <Text style={styles.counterTitle}>{t('common.female')}</Text>
          <Text style={styles.counterValue}>{stats.female}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#E0E0E0' }]}>
          <Text style={styles.counterTitle}>{t('common.others')}</Text>
          <Text style={styles.counterValue}>{stats.other}</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#BBDEFB' }]}>
          <Text style={styles.counterTitle}>{t('common.total')}</Text>
          <Text style={styles.counterValue}>{stats.total}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#90A4AE" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* List */}
      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#90A4AE', fontWeight: '700' }}>{t('common.noVoters')}</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 12 }} showsVerticalScrollIndicator={false}>
          {items.map((it:any) => {
            const serial = it.serialNo || '-';
            const section = it.section || '1';
            const part = it.part ?? 0;
            const epic = it.epicId || '';
            const name = it.voterName || '-';
            const relLine = [it.relationName, it.relationType].filter(Boolean).join(' ');
            const addrLine = it.address ? String(it.address) : '';
            return (
              <View key={it._id} style={styles.card}>
                {/* header meta */}
                <View style={styles.metaRow}>
                  <Text style={styles.meta}><Text style={styles.metaKey}>{t('dashboard.serial')} :</Text> {serial}</Text>
                  <Text style={[styles.meta,{marginLeft:12}]}><Text style={styles.metaKey}>{t('dashboard.section')} :</Text> {section}</Text>
                  <Text style={[styles.meta,{marginLeft:12}]}><Text style={styles.metaKey}>{t('dashboard.part')} :</Text> {part}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {/* left image placeholder with epic badge */}
                  <View style={styles.thumb}>
                    <Icon name="image" size={20} color="#90A4AE" />
                    {!!epic && (
                      <View style={styles.epicBadge}><Text style={styles.epicBadgeText}>{epic}</Text></View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.name}>{name}</Text>
                    {!!relLine && <Text style={styles.nameTamil}>{relLine}</Text>}
                    {!!addrLine && <Text style={styles.addr}>{t('dashboard.doorNo')} {addrLine.match(/\d+/)?.[0] || addrLine}</Text>}
                  </View>
                </View>

                <View style={styles.bottomRow}> 
                  <Icon name="person" size={16} color="#607D8B" />
                  <Text style={styles.bottomText}> {it.age ?? '-'}  |  {it.relationType || ''}</Text>
                </View>
              </View>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Filters bottom sheet */}
      {filtersVisible && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterCard}>
            <Text style={styles.filterTitle}>{t('dashboard.filterVoters')}</Text>
            <Text style={styles.filterSubtitle}>{t('dashboard.filterSubtitle')}</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.sectionTitle}>{t('dashboard.age')}</Text>
              <View style={{ paddingHorizontal: 0, marginBottom: 6 }}>
                <View style={{ paddingHorizontal: 0, paddingTop: 8 }}>
                  <MultiSlider
                    values={[minAge, maxAge]}
                    min={0}
                    max={120}
                    step={1}
                    sliderLength={width - 64}
                    onValuesChange={(vals) => {
                      const a = Math.round(Math.min(vals[0], vals[1]));
                      const b = Math.round(Math.max(vals[0], vals[1]));
                      setMinAge(a);
                      setMaxAge(b);
                    }}
                    allowOverlap={false}
                    snapped
                    selectedStyle={{ backgroundColor: '#1976D2' }}
                    unselectedStyle={{ backgroundColor: '#BBDEFB' }}
                    markerStyle={{ height: 22, width: 22, backgroundColor: '#1976D2' }}
                    trackStyle={{ height: 4 }}
                    enableLabel
                    customLabel={AgeLabel}
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.gender')}</Text>
              <View style={styles.chipsRow}>
                {['male','female','other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, genderFilter.has(g) && styles.chipActive]}
                    onPress={() => {
                      const s = new Set(genderFilter);
                      s.has(g) ? s.delete(g) : s.add(g);
                      setGenderFilter(s);
                    }}
                  >
                    <Icon name="person" size={16} color={genderFilter.has(g) ? '#1976D2' : '#607D8B'} />
                    <Text style={[styles.chipText, genderFilter.has(g) && styles.chipTextActive]}>{g.charAt(0).toUpperCase()+g.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.voterHistory')}</Text>
              <View style={styles.chipsRowWrap}>
                {histories.map((h:any) => (
                  <TouchableOpacity
                    key={h.id || h._id}
                    style={[styles.circleChip, selectedHistory.has(h.id || h._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedHistory);
                      const id = h.id || h._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedHistory(s);
                    }}
                  >
                    <Text style={styles.circleChipText}>{h.tag || h.title?.[0] || 'H'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.voterCategory')}</Text>
              <View style={styles.chipsRowWrap}>
                {categories.map((c:any) => (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.circleChip, selectedCategory.has(c.id || c._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedCategory);
                      const id = c.id || c._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedCategory(s);
                    }}
                  >
                    <Icon name="check-circle" size={18} color={selectedCategory.has(c.id || c._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.politicalParty')}</Text>
              <View style={styles.chipsRowWrap}>
                {parties.map((p:any) => (
                  <TouchableOpacity
                    key={p.id || p._id}
                    style={[styles.circleChip, selectedParty.has(p.id || p._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedParty);
                      const id = p.id || p._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedParty(s);
                    }}
                  >
                    <Icon name="flag" size={18} color={selectedParty.has(p.id || p._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('dashboard.religion')}</Text>
              <View style={styles.chipsRowWrap}>
                {religions.map((r:any) => (
                  <TouchableOpacity
                    key={r.id || r._id}
                    style={[styles.circleChip, selectedReligion.has(r.id || r._id) && styles.circleChipActive]}
                    onPress={() => {
                      const s = new Set(selectedReligion);
                      const id = r.id || r._id;
                      s.has(id) ? s.delete(id) : s.add(id);
                      setSelectedReligion(s);
                    }}
                  >
                    <Icon name="temple-buddhist" size={18} color={selectedReligion.has(r.id || r._id) ? '#1976D2' : '#90A4AE'} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={() => { setMinAge(0); setMaxAge(120); setGenderFilter(new Set()); setSelectedHistory(new Set()); setSelectedCategory(new Set()); setSelectedParty(new Set()); setSelectedReligion(new Set()); }}>
                <Text style={styles.clearText}>{t('dashboard.clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setFiltersVisible(false)}>
                <Text style={styles.applyText}>{t('dashboard.applyFilters')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBar} onPress={() => setFiltersVisible(false)}>
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Create Soon Voter Form */}
      <Modal visible={formVisible} transparent animationType="fade" onRequestClose={() => setFormVisible(false)}>
        <View style={styles.formOverlay}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{t('soonVoter.title')}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Icon name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }}>
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>{t('soonVoter.info')}</Text>
              </View>

              {renderInput(t('soonVoter.partZero'), 'part', String(form.part ?? 0), (v) => setForm(prev => ({ ...prev, part: Number(v) || 0 })), true)}
              {renderInput(t('soonVoter.serialNo'), 'serialNo', form.serialNo || '', (v) => setForm(prev => ({ ...prev, serialNo: v })))}
              {renderInput(t('soonVoter.epicId'), 'epicId', form.epicId || '', (v) => setForm(prev => ({ ...prev, epicId: v })))}
              {renderInput(t('soonVoter.voterName'), 'voterName', form.voterName || '', (v) => setForm(prev => ({ ...prev, voterName: v })))}
              {renderInput(t('soonVoter.relationName'), 'relationName', form.relationName || '', (v) => setForm(prev => ({ ...prev, relationName: v })))}
              {renderInput(t('soonVoter.relationType'), 'relationType', form.relationType || '', (v) => setForm(prev => ({ ...prev, relationType: v })))}
              {renderInput(t('soonVoter.mobileNumber'), 'mobileNumber', form.mobileNumber || '', (v) => setForm(prev => ({ ...prev, mobileNumber: v })))}
              {renderInput(t('soonVoter.dateOfBirth'), 'dateOfBirth', form.dateOfBirth || '', (v) => setForm(prev => ({ ...prev, dateOfBirth: v })))}
              {renderInput(t('soonVoter.age'), 'age', String(form.age ?? ''), (v) => setForm(prev => ({ ...prev, age: Number(v) || undefined })))}

              {renderInput(t('soonVoter.ne'), 'ne', form.ne || '', (v) => setForm(prev => ({ ...prev, ne: v })))}

              {renderInput(t('soonVoter.fullAddress'), 'address', form.address || '', (v) => setForm(prev => ({ ...prev, address: v })))}

              <Text style={styles.sectionHeader}>{t('dashboard.gender')}</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderChip, form.gender === 'male' && styles.genderChipActive]}
                  onPress={() => setForm(prev => ({ ...prev, gender: 'male' }))}
                >
                  <Icon name="person" size={16} color={form.gender === 'male' ? '#1976D2' : '#607D8B'} />
                  <Text style={{ marginLeft: 6, color: form.gender === 'male' ? '#1976D2' : '#455A64', fontWeight: form.gender === 'male' ? '700' : '500' }}>{t('common.male')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderChip, form.gender === 'female' && styles.genderChipActive]}
                  onPress={() => setForm(prev => ({ ...prev, gender: 'female' }))}
                >
                  <Icon name="person" size={16} color={form.gender === 'female' ? '#1976D2' : '#607D8B'} />
                  <Text style={{ marginLeft: 6, color: form.gender === 'female' ? '#1976D2' : '#455A64', fontWeight: form.gender === 'female' ? '700' : '500' }}>{t('common.female')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderChip, form.gender === 'other' && styles.genderChipActive]}
                  onPress={() => setForm(prev => ({ ...prev, gender: 'other' }))}
                >
                  <Icon name="person" size={16} color={form.gender === 'other' ? '#1976D2' : '#607D8B'} />
                  <Text style={{ marginLeft: 6, color: form.gender === 'other' ? '#1976D2' : '#455A64', fontWeight: form.gender === 'other' ? '700' : '500' }}>{t('common.others')}</Text>
                </TouchableOpacity>
              </View>

              

              <TextInput
                style={styles.remarks}
                placeholder={t('soonVoter.addRemarks')}
                placeholderTextColor="#9AA5B1"
                value={form.remarks || ''}
                onChangeText={(v) => setForm(prev => ({ ...prev, remarks: v }))}
                multiline
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={async () => {
                try {
                  setSubmitting(true);
                  // Normalize payload before sending
                  const norm = (() => {
                    const p: any = { ...form };
                    // Normalize date: accept dd-mm-yyyy or d-m-yyyy, also dd/mm/yyyy
                    if (p.dateOfBirth) {
                      const raw: string = String(p.dateOfBirth).trim();
                      const sep = raw.includes('/') ? '/' : '-';
                      const parts = raw.split(sep).map((x: string) => x.trim());
                      if (parts.length === 3) {
                        // Try dd-mm-yyyy first
                        let [a,b,c] = parts;
                        let dd = a, mm = b, yyyy = c;
                        // If first part is 4-digit year, treat as yyyy-mm-dd
                        if (/^\d{4}$/.test(a)) {
                          yyyy = a; mm = b; dd = c;
                        }
                        const dd2 = String(dd).padStart(2, '0');
                        const mm2 = String(mm).padStart(2, '0');
                        const iso = `${yyyy}-${mm2}-${dd2}`;
                        const dt = new Date(iso);
                        if (!isNaN(dt.getTime())) p.dateOfBirth = iso;
                      }
                    }
                    if (typeof p.part !== 'number') p.part = Number(p.part) || 0;
                    if (p.age !== undefined) p.age = Number(p.age) || undefined;
                    if (p.gender) p.gender = String(p.gender).toLowerCase();
                    // Ensure GeoJSON location structure
                    // Remove location field entirely per request
                    if (p.location) delete p.location;
                    // Remove empty strings
                    Object.keys(p).forEach(k => { if (p[k] === '' || p[k] === null) delete p[k]; });
                    return p;
                  })();
                  const res = await soonVoterAPI.create(norm);
                  if (res?.success) {
                    setFormVisible(false);
                    setForm({ part: 0 });
                    // Optimistically prepend new item to list and update counters instantly
                    if (res.data) {
                      setItems(prev => [res.data, ...prev]);
                    } else {
                      await load();
                    }
                  } else {
                    // Show brief inline error if backend rejects
                    alert(res?.message || 'Failed to save.');
                  }
                } catch (e: any) {
                  alert(e?.message || 'Network error');
                } finally { setSubmitting(false); }
              }}
              disabled={submitting}
            >
              <Text style={styles.submitText}>{submitting ? t('common.saving') : t('soonVoter.addVoter')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helpers
function renderInput(label: string, key: string, value: string, onChange: (v: string) => void, disabled?: boolean) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name="touch-app" size={18} color="#1565C0" />
        <Text style={{ marginLeft: 8, color: '#607D8B', fontWeight: '600' }}>{label}</Text>
      </View>
      <TextInput value={value} editable={!disabled} onChangeText={onChange} placeholder={label} placeholderTextColor="#9AA5B1" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 12, color: '#000' }} />
    </View>
  );
}

function renderGender(val: 'male'|'female'|'other', title: string) {
  // This is used inside component via bind
  // @ts-ignore
  const self = this as any;
  const active = self?.form?.gender === val;
  return (
    <TouchableOpacity
      style={[self.styles.genderChip, active && self.styles.genderChipActive]}
      onPress={() => self.setForm((prev: any) => ({ ...prev, gender: val }))}
    >
      <Icon name="person" size={16} color={active ? '#1976D2' : '#607D8B'} />
      <Text style={{ marginLeft: 6, color: active ? '#1976D2' : '#455A64', fontWeight: active ? '700' : '500' }}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#E3F2FD', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },

  countersRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12 },
  counterCard: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10, marginHorizontal: 4 },
  counterTitle: { fontWeight: '700', color: '#000' },
  counterValue: { fontSize: 18, fontWeight: '800', color: '#000' },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 2 },
  searchInput: { marginLeft: 8, flex: 1, color: '#000' },

  fab: { position: 'absolute', right: 20, bottom: 30, width: 52, height: 52, borderRadius: 26, backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center', elevation: 4 },

  // Form modal
  formOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, width: '92%', maxWidth: 520, padding: 16 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  infoBanner: { backgroundColor: '#E3F2FD', borderLeftWidth: 4, borderLeftColor: '#1976D2', padding: 12, borderRadius: 8, marginBottom: 12 },
  infoText: { color: '#0D47A1', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 12, color: '#000', marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelText: { fontSize: 14, color: '#607D8B', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationBtn: { backgroundColor: '#0D47A1', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 8, marginBottom: 10 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, marginRight: 8, justifyContent: 'center' },
  genderChipActive: { borderWidth: 1, borderColor: '#1976D2', backgroundColor: '#E3F2FD' },
  remarks: { minHeight: 90, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 12, color: '#000' },
  submitBtn: { backgroundColor: '#0D47A1', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginTop: 12 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Filter modal styles
  filterOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  filterTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  filterSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 12, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF2FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  chipText: { color: '#455A64', fontSize: 14 },
  chipTextActive: { color: '#1976D2', fontWeight: '600' },
  chipsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  circleChip: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF2FE', alignItems: 'center', justifyContent: 'center' },
  circleChipActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' },
  circleChipText: { color: '#1976D2', fontWeight: '700' },
  filterFooter: { flexDirection: 'row', gap: 12, marginTop: 14 },
  clearButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  clearText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  applyButton: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#90CAF9', borderRadius: 12 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeBar: { marginTop: 12, backgroundColor: '#111827', borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  // list styles similar to reference card
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginVertical: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 1 },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ECEFF1', paddingBottom: 6 },
  metaKey: { color: '#607D8B', fontWeight: '700' },
  meta: { color: '#263238', fontWeight: '600' },
  thumb: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  epicBadge: { position: 'absolute', left: -6, bottom: 8, backgroundColor: '#1565C0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  epicBadgeText: { color: '#E3F2FD', fontSize: 10, fontWeight: '700' },
  name: { color: '#263238', fontWeight: '700', fontSize: 14 },
  nameTamil: { color: '#263238', fontWeight: '700', fontSize: 14, marginTop: 2 },
  addr: { color: '#78909C', marginTop: 4 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bottomText: { color: '#455A64', marginLeft: 6 },
});


