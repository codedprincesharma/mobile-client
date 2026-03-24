import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../src/api/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily } from '../../constants/theme';
import { Images } from '../../constants/Assets';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });
      // FIX: Access token from data.data.token
      if (data.success && data.data.token) {
        await AsyncStorage.setItem('token', data.data.token);
        router.replace('/(tabs)');
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={Images.logo} style={styles.logo} />
          <Text style={styles.brandName}>QuickShop</Text>
          <Text style={styles.subtitle}>Your premium delivery partner</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome Back</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  brandName: { fontSize: 28, fontFamily: FontFamily.extraBold, color: Colors.light.tint, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: FontFamily.medium, color: '#666', marginTop: 5 },
  
  formCard: { 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8
  },
  title: { fontSize: 26, fontFamily: FontFamily.extraBold, color: '#1c1c1c', marginBottom: 25 },
  
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontFamily: FontFamily.bold, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#f0f0f0', 
    padding: 16, 
    borderRadius: 15, 
    fontSize: 16, 
    fontFamily: FontFamily.medium,
    backgroundColor: '#fcfcfc',
    color: '#1c1c1c'
  },
  
  button: { 
    backgroundColor: Colors.light.tint, 
    padding: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  disabledButton: { opacity: 0.7, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 18, fontFamily: FontFamily.bold },
  
  linkContainer: { marginTop: 25, alignItems: 'center' },
  linkText: { fontSize: 15, fontFamily: FontFamily.medium, color: '#888' },
  linkBold: { color: Colors.light.tint, fontFamily: FontFamily.bold },
});
