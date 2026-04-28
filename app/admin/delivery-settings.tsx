import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchSettings, adminUpdateSettings } from '../../src/api/services';
import { Colors, FontFamily } from '../../constants/theme';

export default function DeliverySettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Store Location
  const [storeLat, setStoreLat] = useState('');
  const [storeLng, setStoreLng] = useState('');

  // Delivery charges
  const [freeRadius, setFreeRadius] = useState('3');
  const [baseCharge, setBaseCharge] = useState('30');
  const [perKmCharge, setPerKmCharge] = useState('7');
  const [maxRadius, setMaxRadius] = useState('25');

  // GST
  const [gstPercentage, setGstPercentage] = useState('18');

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const res = await fetchSettings();
      if (res?.data) {
        const s = res.data;
        const coords = s.storeLocation?.coordinates || [0, 0];
        setStoreLng(coords[0]?.toString() || '0');
        setStoreLat(coords[1]?.toString() || '0');

        const dc = s.deliveryCharges || {};
        setFreeRadius(dc.freeDeliveryRadius?.toString() || '3');
        setBaseCharge(dc.baseCharge?.toString() || '30');
        setPerKmCharge(dc.perKmCharge?.toString() || '7');
        setMaxRadius(dc.maxDeliveryRadius?.toString() || '25');

        setGstPercentage(s.gstPercentage?.toString() || '18');
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      Alert.alert('Error', 'Could not load current settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to set store location.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setStoreLat(loc.coords.latitude.toFixed(6));
      setStoreLng(loc.coords.longitude.toFixed(6));
      Alert.alert('Success', 'Store location set to your current position.');
    } catch (e) {
      Alert.alert('Error', 'Could not fetch your location.');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const lat = parseFloat(storeLat);
    const lng = parseFloat(storeLng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Input', 'Please enter valid latitude and longitude.');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid Coordinates', 'Latitude must be -90 to 90, Longitude must be -180 to 180.');
      return;
    }

    const freeR = parseFloat(freeRadius);
    const base = parseFloat(baseCharge);
    const perKm = parseFloat(perKmCharge);
    const maxR = parseFloat(maxRadius);
    const gst = parseFloat(gstPercentage);

    if ([freeR, base, perKm, maxR, gst].some(isNaN)) {
      Alert.alert('Invalid Input', 'All fields must be valid numbers.');
      return;
    }
    if (freeR < 0 || base < 0 || perKm < 0 || maxR < 1 || gst < 0 || gst > 100) {
      Alert.alert('Invalid Values', 'Please ensure all values are within valid ranges.');
      return;
    }
    if (freeR >= maxR) {
      Alert.alert('Invalid Config', 'Free delivery radius must be less than max delivery radius.');
      return;
    }

    setSaving(true);
    try {
      await adminUpdateSettings({
        storeLocation: {
          coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
        },
        deliveryCharges: {
          freeDeliveryRadius: freeR,
          baseCharge: base,
          perKmCharge: perKm,
          maxDeliveryRadius: maxR,
        },
        gstPercentage: gst,
      });
      Alert.alert('Saved ✓', 'Delivery settings updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
        <ActivityIndicator size="large" color="#008e42" />
        <Text style={styles.loadingText}>Loading Settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0a3c22" />
      <View style={styles.hero}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Delivery Settings</Text>
            <Text style={styles.heroSubtitle}>Configure delivery charges & GST</Text>
          </View>
          <View style={styles.heroIconBox}>
            <Ionicons name="settings-outline" size={22} color="#0a3c22" />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Store Location ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="location" size={20} color="#2e7d32" />
              </View>
              <Text style={styles.sectionTitle}>Store Location</Text>
            </View>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleUseCurrentLocation}
              disabled={locating}
            >
              <Ionicons name="locate" size={18} color="#fff" />
              <Text style={styles.locationBtnText}>
                {locating ? 'Detecting...' : 'Use Current Location'}
              </Text>
              {locating && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 6 }} />}
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldCol, { marginRight: 12 }]}>
                  <Text style={styles.fieldLabel}>Latitude</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={storeLat}
                    onChangeText={setStoreLat}
                    keyboardType="numeric"
                    placeholder="22.5726"
                    placeholderTextColor="#bbb"
                  />
                </View>
                <View style={styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Longitude</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={storeLng}
                    onChangeText={setStoreLng}
                    keyboardType="numeric"
                    placeholder="88.3639"
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
              {(storeLat === '0' && storeLng === '0') && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning" size={16} color="#f39c12" />
                  <Text style={styles.warningText}>
                    Store location not set. Delivery charges won't apply until configured.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Delivery Pricing ────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="bicycle" size={20} color="#1565c0" />
              </View>
              <Text style={styles.sectionTitle}>Delivery Pricing</Text>
            </View>

            <View style={styles.card}>
              <SettingsField
                label="Free Delivery Radius"
                suffix="km"
                value={freeRadius}
                onChangeText={setFreeRadius}
                hint="Orders within this radius get free delivery"
              />
              <SettingsField
                label="Base Charge"
                suffix="₹"
                value={baseCharge}
                onChangeText={setBaseCharge}
                hint="Flat fee applied beyond free radius"
              />
              <SettingsField
                label="Per Km Charge"
                suffix="₹/km"
                value={perKmCharge}
                onChangeText={setPerKmCharge}
                hint="Extra charge per km beyond free radius"
              />
              <SettingsField
                label="Max Delivery Radius"
                suffix="km"
                value={maxRadius}
                onChangeText={setMaxRadius}
                hint="Orders beyond this distance are rejected"
              />
            </View>

            {/* Live preview */}
            <View style={styles.previewCard}>
              <Ionicons name="calculator-outline" size={18} color="#666" />
              <Text style={styles.previewText}>
                Example: 10 km order → ₹{(parseFloat(baseCharge || '0') + Math.max(0, 10 - parseFloat(freeRadius || '0')) * parseFloat(perKmCharge || '0')).toFixed(0)} delivery fee
              </Text>
            </View>
          </View>

          {/* ── GST ────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="receipt-outline" size={20} color="#e65100" />
              </View>
              <Text style={styles.sectionTitle}>GST Configuration</Text>
            </View>

            <View style={styles.card}>
              <SettingsField
                label="GST Percentage"
                suffix="%"
                value={gstPercentage}
                onChangeText={setGstPercentage}
                hint="Applied on item subtotal only (not on delivery)"
              />
            </View>
          </View>

          {/* ── Save Button ───────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>Save Settings</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Reusable field component ──────────────────────────────────────────────
function SettingsField({
  label,
  suffix,
  value,
  onChangeText,
  hint,
}: {
  label: string;
  suffix: string;
  value: string;
  onChangeText: (t: string) => void;
  hint?: string;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.inputRow}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor="#bbb"
        />
        <View style={fieldStyles.suffixBox}>
          <Text style={fieldStyles.suffixText}>{suffix}</Text>
        </View>
      </View>
      {hint && <Text style={fieldStyles.hint}>{hint}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: '#1a1d1e',
  },
  suffixBox: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderLeftWidth: 0,
  },
  suffixText: { fontSize: 14, fontFamily: FontFamily.bold, color: '#666' },
  hint: { fontSize: 12, fontFamily: FontFamily.regular, color: '#999', marginTop: 4 },
});

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f7fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: FontFamily.medium, color: '#666' },

  hero: {
    backgroundColor: '#0a3c22',
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  heroTitle: { fontSize: 22, fontFamily: FontFamily.extraBold, color: '#fff' },
  heroSubtitle: { fontSize: 13, fontFamily: FontFamily.medium, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: { padding: 20, paddingBottom: 40 },

  section: { marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.bold, color: '#1a1d1e' },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  locationBtn: {
    backgroundColor: '#008e42',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  locationBtnText: { color: '#fff', fontSize: 14, fontFamily: FontFamily.bold },

  fieldRow: { flexDirection: 'row' },
  fieldCol: { flex: 1 },
  fieldLabel: { fontSize: 14, fontFamily: FontFamily.bold, color: '#1a1d1e', marginBottom: 8 },
  fieldInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: '#1a1d1e',
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fff0b3',
  },
  warningText: { fontSize: 12, fontFamily: FontFamily.medium, color: '#8d6e00', flex: 1 },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  previewText: { fontSize: 13, fontFamily: FontFamily.medium, color: '#555', flex: 1 },

  saveBtn: {
    backgroundColor: '#0a3c22',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: '#0a3c22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 17, fontFamily: FontFamily.bold },
});
