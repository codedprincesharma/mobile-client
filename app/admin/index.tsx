import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  RefreshControl,
  Alert,
  useWindowDimensions,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { adminGetStats } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';
import { Icons } from '../../constants/Assets';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrdersAddress: 0,
    bulkOrders: 0
  });

  // Calculate card width responsively (max 2 columns on phones, 3-4 on large tablets)
  const isTablet = width > 600;
  const numColumns = isTablet ? 3 : 2;
  const gap = 16;
  const horizontalPadding = 20;
  // total gap width = (numColumns - 1) * gap
  const cardWidth = (width - (horizontalPadding * 2) - ((numColumns - 1) * gap)) / numColumns;


  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminGetStats();
      if (data && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load admin stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const StatCard = ({ title, value, iconName, color, onPress, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify().damping(16)} style={{ width: cardWidth }}>
      <TouchableOpacity 
        style={[styles.statCard, { borderBottomColor: color, borderBottomWidth: 3 }]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.statHeader}>
          <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={iconName} size={22} color={color} />
          </View>
        </View>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const ShortcutPill = ({ title, iconName, onPress, delay }: any) => (
    <Animated.View entering={FadeInUp.delay(delay).springify().damping(15)}>
      <TouchableOpacity style={styles.shortcutPill} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.shortcutIconWrap}>
           <Ionicons name={iconName} size={20} color="#333" />
        </View>
        <Text style={styles.shortcutText}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" backgroundColor="#fcfcfc" />
        <ActivityIndicator size="large" color="#008e42" />
        <Text style={styles.loadingText}>Awakening Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0a3c22" />
      
      {/* Background overlapping header */}
      <View style={styles.heroBackground}>
         <View style={styles.headerInner}>
           <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
             <Ionicons name="arrow-back" size={24} color="#fff" />
           </TouchableOpacity>
           <View style={{ flex: 1 }}>
             <Text style={styles.welcomeTitle}>Admin Command</Text>
             <Text style={styles.welcomeSubtext}>Business Overview</Text>
           </View>
           <TouchableOpacity style={styles.profileAvatar}>
             <Ionicons name="person" size={20} color="#0a3c22" />
           </TouchableOpacity>
         </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.statsLayout}>
          <StatCard 
            index={0}
            title="Revenue" 
            value={`$${stats.totalRevenue.toFixed(2)}`} 
            iconName="cash-outline" 
            color="#27ae60" 
          />
          <StatCard 
            index={1}
            title="Live Orders" 
            value={stats.totalOrders} 
            iconName="time-outline" 
            color="#2980b9" 
            onPress={() => router.push('/admin/orders' as any)}
          />
          <StatCard 
            index={2}
            title="Total Users" 
            value={stats.totalUsers} 
            iconName="people-outline" 
            color="#f39c12" 
            onPress={() => router.push('/admin/users' as any)}
          />
          <StatCard 
            index={3}
            title="Bulk Requests" 
            value={stats.bulkOrders} 
            iconName="cube-outline" 
            color="#8e44ad" 
            onPress={() => router.push('/admin/bulk-orders' as any)}
          />
        </View>

        {/* Pending Activity Highlight */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(15)} style={styles.insightSection}>
           <View style={styles.insightCard}>
             <View style={styles.insightIconBadge}>
                <Ionicons name="alert-circle" size={24} color="#e74c3c" />
             </View>
             <View style={styles.insightTextCol}>
               <Text style={styles.insightTitle}>Attention Needed</Text>
               <Text style={styles.insightDesc}>You have {stats.pendingOrdersAddress || 0} pending orders awaiting manual confirmation.</Text>
             </View>
             <TouchableOpacity style={styles.insightActionBtn} onPress={() => router.push('/admin/orders' as any)}>
               <Text style={styles.insightActionTxt}>Review</Text>
             </TouchableOpacity>
           </View>
        </Animated.View>

        {/* Quick Actions List */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.pillContainer}>
            <ShortcutPill 
              delay={500}
              title="Inventory & Products" 
              iconName="cube" 
              onPress={() => router.push('/admin/products' as any)} 
            />
            <ShortcutPill 
              delay={600}
              title="Store Categories" 
              iconName="grid" 
              onPress={() => router.push('/admin/categories' as any)} 
            />
            <ShortcutPill 
              delay={700}
              title="Order Logistics" 
              iconName="map" 
              onPress={() => router.push('/admin/orders' as any)} 
            />
            <ShortcutPill 
              delay={800}
              title="Promotions & Coupons" 
              iconName="pricetags" 
              onPress={() => Alert.alert('Coming Soon', 'Dynamic coupon management is under development.')} 
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f7fa' },
  heroBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 240,
    backgroundColor: '#0a3c22', // Deep elegant green
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    zIndex: 0
  },
  headerInner: {
    paddingTop: 65,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  welcomeTitle: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#fff', letterSpacing: -0.5 },
  welcomeSubtext: { fontSize: 13, fontFamily: FontFamily.medium, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  profileAvatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10
  },
  scrollContent: {
    paddingTop: 150, // Pushes overlapping content down over the hero bg
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  statsLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 25
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  statHeader: { marginBottom: 16, alignSelf: 'flex-start' },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1a1d1e', marginBottom: 4, letterSpacing: -0.5 },
  statTitle: { fontSize: 13, fontFamily: FontFamily.medium, color: '#888' },
  
  insightSection: { marginBottom: 25 },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1, borderColor: '#fef0ef'
  },
  insightIconBadge: {
    width: 46, height: 46,
    borderRadius: 23,
    backgroundColor: '#fef0ef',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  insightTextCol: { flex: 1, paddingRight: 10 },
  insightTitle: { fontSize: 15, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 2 },
  insightDesc: { fontSize: 12, fontFamily: FontFamily.medium, color: '#666', lineHeight: 18 },
  insightActionBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12
  },
  insightActionTxt: { color: '#fff', fontSize: 13, fontFamily: FontFamily.bold },

  actionsSection: { flex: 1 },
  sectionHeader: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 15 },
  pillContainer: { gap: 12 },
  shortcutPill: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1
  },
  shortcutIconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f6f5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16
  },
  shortcutText: { flex: 1, fontSize: 16, fontFamily: FontFamily.bold, color: '#1a1d1e' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
  loadingText: { marginTop: 15, fontSize: 14, fontFamily: FontFamily.medium, color: '#666' }
});

