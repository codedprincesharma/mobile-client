import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../constants/theme';

const theme = {
  primary: '#008e42',
  topBg: '#e9f5ed',
  surface: '#ffffff',
  surfaceLow: '#f4f6f5',
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

export default function FAQScreen() {
  const router = useRouter();

  const FAQItem = ({ question, answer }: any) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>FAQ</Text>
        <TouchableOpacity style={styles.contactBtn}>
           <Ionicons name="headset" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
         <FAQItem 
           question="How fast is the delivery?" 
           answer="We aim to deliver your everyday essentials within 10-15 minutes depending on your proximity to our dark stores. Bulk orders and custom catering require prior scheduling." 
         />
         <FAQItem 
           question="How do I use GRIHGO Money?" 
           answer="GRIHGO Money is a convenient in-app wallet. You can add funds via UPI or cards, and use it at checkout for instant payments without OTP verifications." 
         />
         <FAQItem 
           question="Can I cancel my bulk order?" 
           answer="Bulk orders can be modified or cancelled up to 48 hours before the scheduled event delivery date. Cancellations within 48 hours may incur a partial fee." 
         />
         <FAQItem 
           question="Do you deliver 24/7?" 
           answer="Currently, our standard operational hours are 6 AM to Midnight. Deliveries outside these hours are subject to regional availability." 
         />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surfaceLow },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: theme.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  backBtn: { padding: 4 },
  contactBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  container: { flex: 1, padding: 15 },
  
  faqItem: { backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  question: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', marginBottom: 8 },
  answer: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, lineHeight: 22 },
});
