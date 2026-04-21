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
import { register } from '../../src/api/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily } from '../../constants/theme';
import { Images } from '../../constants/Assets';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getTokenFromResponse = (payload: any): string | null => {
    return payload?.token || payload?.data?.token || null;
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await register({ name, email, password });
      const token = getTokenFromResponse(data);
      
      if (data.success && token) {
        await AsyncStorage.setItem('token', token);
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'Start Shopping', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
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
          <Text style={styles.brandName}>GRIHGO</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>Create Account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

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
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
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
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  brandName: { fontSize: 28, fontFamily: FontFamily.extraBold, color: Colors.light.tint, letterSpacing: -0.5 },
  
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
  
  inputContainer: { marginBottom: 18 },
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
