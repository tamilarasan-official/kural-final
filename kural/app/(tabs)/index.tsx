import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

export default function DashboardScreen() {
  const router = useRouter();
  const [constituency, setConstituency] = useState('119 - Thondamuthur');
  const { width } = Dimensions.get('window');
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  // Auto-swipe banners every 3s
  useEffect(() => {
    const id = setInterval(() => {
      const next = (bannerIndex + 1) % 2; // two banners
      setBannerIndex(next);
      bannerRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [bannerIndex, width]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top area with blue background */}
      <View style={styles.topArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(drawer)/drawerscreen')}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.selector} activeOpacity={0.8}>
            <Text style={styles.selectorText}>{constituency}</Text>
            <Text style={styles.selectorChevron}>▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bell}>
            <Text style={styles.bellText}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Manager quick actions */}
        <View style={styles.quickRow}>
          <ManagerCard title="Cadre Manager" source={require('../../assets/images/cadre_manager.png')} />
          <ManagerCard title="Voter Manager" source={require('../../assets/images/voter_manager.png')} />
          <ManagerCard title="Family Manager" source={require('../../assets/images/family_manager.png')} />
          <ManagerCard title="Survey Manager" source={require('../../assets/images/survey_manager.png')} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Voter Id or Voter Name"
            placeholderTextColor="#B0BEC5"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Feature grid (icons + labels, no squares) */}
      <View style={styles.grid}>
        <IconTile title="Cadre" src={require('../../assets/images/cadre.png')} />
        <IconTile title="Part" src={require('../../assets/images/part.png')} />
        <IconTile title="Voter" src={require('../../assets/images/voter.png')} />
        <IconTile title="New" src={require('../../assets/images/New.png')} />
        <IconTile title="Transgender" src={require('../../assets/images/transegender.png')} />
        <IconTile title="Fatherless" src={require('../../assets/images/fatherless.png')} />
        <IconTile title="Guardian" src={require('../../assets/images/guardian.png')} />
        <IconTile title="Overseas" src={require('../../assets/images/overseas.png')} />
        <IconTile title="Birthday" src={require('../../assets/images/birthday.png')} />
        <IconTile title="Star" src={require('../../assets/images/star.png')} />
        <IconTile title="Mobile" src={require('../../assets/images/Mobile.png')} />
        <IconTile title="80 Above" src={require('../../assets/images/80 Above.png')} />
      </View>

      {/* Banners - auto swipe */}
      <ScrollView
        ref={bannerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setBannerIndex(idx);
        }}
        style={styles.bannerScroller}
      >
        <View style={[styles.banner, { width: width - 32, height: 190, backgroundColor: '#2E7D32' }]}>
          <Text style={styles.bannerTitle}>Community Event</Text>
        </View>
        <View style={[styles.banner, { width: width - 32, height: 190, backgroundColor: '#1976D2' }]}>
          <Text style={styles.bannerTitle}>Political Meeting</Text>
        </View>
      </ScrollView>
      <View style={styles.dotsRow}>
        <View style={[styles.dot, bannerIndex === 0 ? styles.dotActive : undefined]} />
        <View style={[styles.dot, bannerIndex === 1 ? styles.dotActive : undefined]} />
      </View>

      {/* Cadre Overview */}
      <Text style={styles.sectionTitle}>Cadre Overview</Text>
      <View style={styles.overviewRow}>
        <OverviewCard title={'Total\nCadres'} value={'0'} accent="#1976D2" large iconEmoji="🚶" />
        <View style={styles.overviewColSmall}>
          <OverviewCard title={'Cadre\nActive'} value={'0'} accent="#2E7D32" />
          <OverviewCard title={'Logged\nIn'} value={'0'} accent="#2E7D32" />
        </View>
        <View style={styles.overviewColSmall}>
          <OverviewCard title={'Cadre\nInActive'} value={'0'} accent="#D32F2F" />
          <OverviewCard title={'Not\nLogged'} value={'0'} accent="#D32F2F" />
        </View>
      </View>
    </ScrollView>
  );
}

type ManagerCardProps = { title: string; source: any };
const ManagerCard = ({ title, source }: ManagerCardProps) => (
  <TouchableOpacity style={styles.managerCard} activeOpacity={0.8}>
    <Image source={source} style={styles.managerIcon} />
    <Text style={styles.managerLabel}>{title}</Text>
  </TouchableOpacity>
);

type IconTileProps = { title: string; src: any };
const IconTile = ({ title, src }: IconTileProps) => (
  <TouchableOpacity style={styles.tileIconOnly} activeOpacity={0.8}>
    <Image source={src} style={styles.tileIcon} />
    <Text style={styles.tileLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
      {title}
    </Text>
  </TouchableOpacity>
);

type OverviewCardProps = {
  title: string;
  value: string;
  accent: string;
  large?: boolean;
  iconEmoji?: string;
};

const OverviewCard = ({ title, value, accent, large, iconEmoji }: OverviewCardProps) => (
  <View style={[large ? styles.overviewLarge : styles.overviewSmall]}>
    {iconEmoji ? <Text style={styles.overviewIcon}>{iconEmoji}</Text> : null}
    <Text style={styles.overviewTitle}>{title}</Text>
    <View style={[styles.badge, { backgroundColor: accent }]}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    backgroundColor: '#F3F6FB',
  },
  topArea: {
    backgroundColor: '#E6F0FE',
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBar: {
    width: 20,
    height: 2,
    backgroundColor: '#263238',
    marginVertical: 2,
    borderRadius: 2,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 8,
    elevation: 2,
  },
  selectorText: {
    flex: 1,
    fontWeight: '600',
    color: '#263238',
  },
  selectorChevron: {
    marginLeft: 8,
    color: '#607D8B',
    fontSize: 16,
  },
  bell: {
    width: 44,
    height: 44,
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellText: { color: '#fff', fontSize: 16 },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  managerIcon: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 8 },
  managerLabel: { textAlign: 'center', fontSize: 12, color: '#263238' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 12,
    height: 48,
    flex: 1,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, color: '#90A4AE' },
  searchInput: { flex: 1, marginLeft: 8, color: '#263238' },
  filterButton: {
    width: 48,
    height: 48,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  filterText: { fontSize: 18, color: '#263238' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
  },
  tileIconOnly: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  tileIcon: { width: 44, height: 44, resizeMode: 'contain', marginBottom: 6 },
  tileLabel: { fontSize: 13, color: '#263238', textAlign: 'center' },

  bannerScroller: { marginTop: 8 },
  banner: {
    height: 160,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CFD8DC', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#1565C0' },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  overviewRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 },
  overviewLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  overviewSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  overviewColSmall: { width: 130, marginLeft: 12 },
  overviewIcon: { fontSize: 32, marginBottom: 8 },
  overviewTitle: { textAlign: 'center', color: '#263238', marginBottom: 12, fontWeight: '700', fontSize: 18 },
  badge: { minWidth: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
});
