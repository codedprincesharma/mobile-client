import React, { useEffect, useState } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { login, googleLogin } from '../../src/api/services';
import {
  googleAuthRequestConfig,
  googleAuthMissingConfigMessage,
  googleAuthReady,
} from '../../src/config/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontFamily } from '../../constants/theme';
import { Images } from '../../constants/Assets';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();



export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getTokenFromResponse = (payload: any): string | null => {
    return payload?.token || payload?.data?.token || null;
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthRequestConfig);

  const handleGoogleSignIn = async () => {
    if (!googleAuthReady) {
      Alert.alert('Error', googleAuthMissingConfigMessage);
      return;
    }

    if (!request) {
      Alert.alert('Error', 'Google authentication is not ready yet.');
      return;
    }

    await promptAsync();
  };

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'error') {
      Alert.alert('Google Login Failed', response.error?.message || 'Unable to authenticate with Google.');
      return;
    }

    if (response.type !== 'success') {
      return;
    }

    const idToken = response.params?.id_token || response.authentication?.idToken;
    if (!idToken) {
      Alert.alert('Error', 'Google login did not return an ID token. Check your OAuth client IDs and redirect URI setup.');
      return;
    }

    handleGoogleResponse(idToken);
  }, [response]);

  const handleGoogleResponse = async (idToken: string) => {
    setLoading(true);
    try {
      const data = await googleLogin(idToken);
      const token = getTokenFromResponse(data);
      if (data.success && token) {
        await AsyncStorage.setItem('token', token);
        router.replace('/(tabs)');
      } else {
        throw new Error('Google login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });
      const token = getTokenFromResponse(data);
      if (data.success && token) {
        await AsyncStorage.setItem('token', token);
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
      {/* Background Watermarks */}
      <Image source={Images.logo} style={styles.watermark1} tintColor="#e8f3ec" />
      <Image source={Images.logo} style={styles.watermark2} tintColor="#e8f3ec" />
      <Image source={Images.logo} style={styles.watermark3} tintColor="#e8f3ec" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Image source={Images.logo} style={styles.logo} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome to Fresh</Text>
          <Text style={styles.subtitle}>Welcome to the grocery.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
             <TextInput
                style={styles.input}
               placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
               keyboardType="email-address"
                placeholderTextColor="#a9a9a9"
             />
          </View>

          <View style={styles.inputWrapper}>
             <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#a9a9a9"
             />
             <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
             </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View 
              style={[styles.button, { backgroundColor: '#008e42' }, loading && styles.disabledButton]}
            >
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGoogleSignIn}
            disabled={loading || !request || !googleAuthReady}
            activeOpacity={0.8}
          >
            <View 
              style={[styles.button, styles.googleButton, (loading || !request || !googleAuthReady) && styles.disabledButton]}
            >
              <Ionicons name="logo-google" size={20} color="#333" style={styles.googleIcon} />
              <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              New to GrihGO? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', position: 'relative' },
  
  // Watermarks
  watermark1: { position: 'absolute', width: 140, height: 140, bottom: -20, left: -20, opacity: 0.6, resizeMode: 'contain', zIndex: 0 },
  watermark2: { position: 'absolute', width: 100, height: 100, top: '45%', left: 20, opacity: 0.6, resizeMode: 'contain', zIndex: 0 },
  watermark3: { position: 'absolute', width: 120, height: 120, bottom: 80, right: -10, opacity: 0.6, resizeMode: 'contain', zIndex: 0 },

  scrollContent: { flexGrow: 1, padding: 30, justifyContent: 'center', zIndex: 1 },
  
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 140, height: 140, resizeMode: 'contain' },
  
  titleSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontFamily: FontFamily.extraBold, color: '#1a1d1e' },
  subtitle: { fontSize: 14, fontFamily: FontFamily.medium, color: '#666', marginTop: 4 },
  
  formContainer: { width: '100%' },
  
  inputWrapper: {
    backgroundColor: '#f6f6f6',
    borderRadius: 25,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
  },
  input: { 
    flex: 1,
    fontSize: 15, 
    fontFamily: FontFamily.medium,
    color: '#1a1d1e',
    height: '100%'
  },
  eyeIcon: {
    padding: 5,
  },
  
  button: { 
    height: 55, 
    borderRadius: 27.5, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#008e42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    flexDirection: 'row',
  },
  googleButtonText: {
    color: '#333',
    marginLeft: 8,
  },
  googleIcon: {
    marginRight: 8,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 18, fontFamily: FontFamily.bold },
  
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 13, fontFamily: FontFamily.medium, color: '#666' },
  linkBold: { color: '#008e42', fontFamily: FontFamily.bold },
});
