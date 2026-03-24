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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminGetStats } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';
import { Icons } from '../../constants/Assets';

export default function AdminDashboardScreen() {
  const router = useRouter();
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

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Image source={icon} style={[styles.statIcon, { tintColor: color }]} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const ShortcutBtn = ({ title, icon, onPress }: any) => (
    <TouchableOpacity style={styles.shortcutBtn} onPress={onPress}>
      <Image source={icon} style={styles.shortcutIcon} />
      <Text style={styles.shortcutText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.welcome}>Admin Hub</Text>
          <Text style={styles.subtext}>Manage your business overview</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Revenue" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
          icon={Icons.bucket} 
          color="#4CAF50" 
        />
        <StatCard 
          title="Orders" 
          value={stats.totalOrders} 
          icon={Icons.clock} 
          color="#2196F3" 
          onPress={() => router.push('/admin/orders' as any)}
        />
        <StatCard 
          title="Users" 
          value={stats.totalUsers} 
          icon={Icons.home} 
          color="#FF9800" 
          onPress={() => router.push('/admin/users' as any)}
        />
        <StatCard 
          title="Bulk Requests" 
          value={stats.bulkOrders} 
          icon={Icons.delivery} 
          color="#E91E63" 
          onPress={() => router.push('/admin/bulk-orders' as any)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management Shortcuts</Text>
        <View style={styles.shortcutsGrid}>
          <ShortcutBtn 
            title="Manage Products" 
            icon={Icons.store} 
            onPress={() => router.push('/admin/products' as any)} 
          />
          <ShortcutBtn 
            title="Manage Categories" 
            icon={Icons.bucket} // Using bucket as placeholder for category
            onPress={() => router.push('/admin/categories' as any)} 
          />
          <ShortcutBtn 
            title="Track Orders" 
            icon={Icons.my_pin} 
            onPress={() => router.push('/admin/orders' as any)} 
          />
          <ShortcutBtn 
            title="Coupons & Offers" 
            icon={Icons.coupon} 
            onPress={() => Alert.alert('Coming Soon', 'Dynamic coupon management is under development.')} 
          />
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Business Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            You have {stats.pendingOrdersAddress || 0} pending orders that need confirmation.
          </Text>
          <TouchableOpacity onPress={() => router.push('/admin/orders' as any)}>
            <Text style={styles.actionLink}>View Orders →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backBtn: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c' },
  welcome: { fontSize: 22, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  subtext: { fontSize: 13, color: '#888', fontFamily: FontFamily.regular },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: 10, 
    justifyContent: 'space-between' 
  },
  statCard: { 
    backgroundColor: '#fff', 
    width: '47%', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  iconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10
  },
  statIcon: { width: 20, height: 20 },
  statValue: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  statTitle: { fontSize: 12, color: '#888', fontFamily: FontFamily.medium },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1c1c1c', marginBottom: 15 },
  shortcutsGrid: { gap: 12 },
  shortcutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  shortcutIcon: { width: 22, height: 22, marginRight: 15, tintColor: Colors.light.tint },
  shortcutText: { fontSize: 15, fontFamily: FontFamily.medium, color: '#333' },
  recentActivity: { padding: 20, paddingTop: 0 },
  insightCard: { 
    backgroundColor: Colors.light.tint + '10', 
    padding: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.tint + '20'
  },
  insightText: { fontSize: 14, color: '#555', fontFamily: FontFamily.medium, lineHeight: 20, marginBottom: 10 },
  actionLink: { color: Colors.light.tint, fontSize: 14, fontFamily: FontFamily.bold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#888', fontFamily: FontFamily.medium }
});
