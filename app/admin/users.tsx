import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { adminGetUsers, adminUpdateUserStatus } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminGetUsers();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Failed to load users', error);
      Alert.alert('Error', 'Failed to load registered users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminUpdateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{item.role.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.actionSection}>
        <Text style={[styles.statusLabel, { color: item.isActive ? '#4CAF50' : '#F44336' }]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
        <Switch 
          value={item.isActive} 
          onValueChange={() => toggleUserStatus(item._id, item.isActive)}
          trackColor={{ false: '#eee', true: Colors.light.tint + '50' }}
          thumbColor={item.isActive ? Colors.light.tint : '#ccc'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadUsers}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No users registered yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c' },
  title: { fontSize: 20, fontFamily: FontFamily.bold, color: '#1c1c1c' },
  listContent: { padding: 15 },
  userCard: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontFamily: FontFamily.bold, color: '#1c1c1c', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#888', fontFamily: FontFamily.regular, marginBottom: 6 },
  roleBadge: { 
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 5 
  },
  roleText: { fontSize: 10, fontFamily: FontFamily.bold, color: '#666' },
  actionSection: { alignItems: 'center' },
  statusLabel: { fontSize: 11, fontFamily: FontFamily.bold, marginBottom: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#888', textAlign: 'center' }
});
