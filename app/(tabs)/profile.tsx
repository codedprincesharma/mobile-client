import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMe, updateProfile } from '../../src/api/services';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../../constants/theme';

const theme = {
  primary: '#008e42', 
  topBg: '#e9f5ed',   
  surface: '#ffffff',
  surfaceLow: '#f4f6f5', 
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState({ name: '', phone: '', dob: '', role: '' });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', dob: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchMe();
      if (data && data.data) {
        setUser({ 
          name: data.data.name || 'Set your name', 
          phone: data.data.phone || 'Add Phone', 
          dob: data.data.dob || 'Add Birthday',
          role: data.data.role 
        });
        setEditForm({
          name: data.data.name || '',
          phone: data.data.phone || '',
          dob: data.data.dob || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile', error);
      Alert.alert('Error', 'Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const response = await updateProfile(editForm);
      if (response && response.success) {
        setUser((prev) => ({ ...prev, ...editForm }));
        setIsEditModalVisible(false);
      }
    } catch (error: any) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  const ListItem = ({ icon, label, onPress, hideBorder = false, isLogout = false }: { icon: any, label: string, onPress?: () => void, hideBorder?: boolean, isLogout?: boolean }) => (
    <TouchableOpacity style={[styles.listItem, hideBorder && { borderBottomWidth: 0 }]} onPress={onPress}>
      <View style={styles.listItemLeft}>
         <Ionicons name={icon} size={20} color={isLogout ? '#1a1d1e' : '#555'} style={{ marginRight: 15 }} />
         <Text style={[styles.listItemText]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bcc3c0" />
    </TouchableOpacity>
  );

  const EditProfileModal = () => (
    <Modal visible={isEditModalVisible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput 
              style={styles.modalInput} 
              value={editForm.name} 
              onChangeText={(text) => setEditForm({ ...editForm, name: text })} 
              placeholder="e.g. John Doe"
            />
            
            <Text style={styles.modalLabel}>Phone Number</Text>
            <TextInput 
              style={styles.modalInput} 
              value={editForm.phone} 
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })} 
              keyboardType="phone-pad"
              placeholder="+91 0000000000"
            />
            
            <Text style={styles.modalLabel}>Birthday (YYYY-MM-DD)</Text>
            <TextInput 
              style={styles.modalInput} 
              value={editForm.dob} 
              onChangeText={(text) => setEditForm({ ...editForm, dob: text })} 
              placeholder="e.g. 2000-01-01"
            />
          </ScrollView>

          <TouchableOpacity 
            style={[styles.saveButton, updating && { opacity: 0.7 }]} 
            onPress={handleUpdateProfile} 
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ccedc2" />
      
      <View style={styles.topGradientBg} />
      
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileHeroSection}>
           <View style={styles.avatarBubble}>
              <Ionicons name="person" size={54} color="#1a1d1e" />
           </View>
           <Text style={styles.userName}>{user.name}</Text>
           <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={12} color={theme.onSurfaceVariant} />
              <Text style={styles.contactText}>{user.phone}</Text>
              <Ionicons name="gift-outline" size={12} color={theme.onSurfaceVariant} style={{marginLeft: 10}} />
              <Text style={styles.contactText}>{user.dob}</Text>
           </View>
        </View>

        <View style={styles.quickActionsRow}>
           <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/orders')}>
              <View style={[styles.quickIconWrapper, { backgroundColor: '#eef6d4' }]}>
                 <Ionicons name="basket" size={24} color="#8dbb25" />
              </View>
              <Text style={styles.quickCardText}>Your Orders</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/bulk-order')}>
              <View style={[styles.quickIconWrapper, { backgroundColor: '#fdfce1' }]}>
                 <Ionicons name="wallet" size={24} color="#bdc247" />
              </View>
              <Text style={styles.quickCardText}>GRIHGO Money</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIconWrapper, { backgroundColor: '#e2f5e1' }]}>
                 <Ionicons name="chatbubbles" size={24} color="#489c37" />
              </View>
              <Text style={styles.quickCardText}>Need Help ?</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
           <Text style={styles.cardGroupTitle}>Your information</Text>
           <ListItem icon="person-outline" label="Update profile" onPress={() => setIsEditModalVisible(true)} />
           <ListItem icon="book-outline" label="Address book" onPress={() => router.push('/address-book' as any)} />
           <ListItem icon="heart-outline" label="Your wishlist" onPress={() => router.push('/wishlist' as any)} />
           {user.role === 'admin' && (
              <ListItem icon="shield-checkmark-outline" label="Admin Panel (Pro)" onPress={() => router.push('/admin' as any)} />
           )}
           <ListItem icon="ticket-outline" label="Raised tickets" onPress={() => router.push('/tickets' as any)} hideBorder />
        </View>

        <View style={styles.cardSection}>
           <Text style={styles.cardGroupTitle}>Payment and coupons</Text>
           <ListItem icon="wallet-outline" label="GRIHGO Money" onPress={() => router.push('/wallet' as any)} hideBorder />
        </View>

        <View style={styles.cardSection}>
           <Text style={styles.cardGroupTitle}>Other Information</Text>
           <ListItem icon="share-social-outline" label="Refer & Earn" onPress={() => router.push('/refer' as any)} />
           <ListItem icon="information-circle-outline" label="About us" onPress={() => router.push('/about' as any)} />
           <ListItem icon="lock-closed-outline" label="Account privacy" onPress={() => router.push('/privacy' as any)} />
           <ListItem icon="notifications-outline" label="Notification preferences" onPress={() => router.push('/notifications' as any)} />
           <ListItem icon="help-circle-outline" label="FAQ" onPress={() => router.push('/faq' as any)} />
           <ListItem icon="log-out-outline" label="Log out" onPress={handleLogout} hideBorder isLogout />
        </View>
        
        <View style={styles.footerBranding}>
            <Text style={styles.footerBrandText}>GRIHGO</Text>
            <Text style={styles.footerVersionText}>v1.0.49</Text>
        </View>

      </ScrollView>

      <EditProfileModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f5' },
  container: { flex: 1 },
  
  topGradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#ccedc2', 
    zIndex: 0
  },

  header: { alignItems: 'center', paddingVertical: 15, zIndex: 1 },
  headerTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: '#000' },
  
  profileHeroSection: { alignItems: 'center', marginTop: 10, zIndex: 1, marginBottom: 20 },
  avatarBubble: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 15
  },
  userName: { fontSize: 20, fontFamily: FontFamily.bold, color: '#000', marginBottom: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactText: { fontSize: 13, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, marginLeft: 6 },

  quickActionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    marginBottom: 20,
    zIndex: 1
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  quickIconWrapper: {
     width: 44,
     height: 44,
     borderRadius: 22,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 10
  },
  quickCardText: { fontSize: 12, fontFamily: FontFamily.bold, color: '#000', textAlign: 'center' },

  cardSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingTop: 15,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
    zIndex: 1
  },
  
  sectionHeaderTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000' },

  cardGroupTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', paddingHorizontal: 15, marginBottom: 5 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, marginHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f3f1' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' },
  listItemText: { fontSize: 15, fontFamily: FontFamily.medium, color: '#1a1d1e' },
  
  footerBranding: { alignItems: 'center', marginVertical: 30 },
  footerBrandText: { fontSize: 22, fontFamily: FontFamily.extraBold, color: '#a0a6a3', letterSpacing: -0.5 },
  footerVersionText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#bcc3c0', marginTop: 4 },

  // Edit Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontFamily: FontFamily.bold, color: '#000' },
  modalLabel: { fontSize: 13, fontFamily: FontFamily.bold, color: theme.onSurfaceVariant, marginBottom: 8 },
  modalInput: { backgroundColor: theme.surfaceLow, borderWidth: 1, borderColor: '#e1e5e3', borderRadius: 12, padding: 14, fontSize: 15, fontFamily: FontFamily.medium, color: theme.onSurface, marginBottom: 20 },
  saveButton: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },
});
