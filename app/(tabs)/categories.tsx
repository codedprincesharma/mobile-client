import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontFamily } from '../../constants/theme';

const theme = {
  primary: '#008e42',
  topBg: '#e9f5ed',
  surface: '#ffffff',
  surfaceLow: '#f4f6f5',
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

const GROCERY_CATEGORIES = [
  { id: '1', name: 'Fruits &\nVegetables', icon: 'leaf-outline', color: '#e8f5ce', iconColor: '#27ae60' },
  { id: '2', name: 'Dairy &\nBakery', icon: 'water-outline', color: '#fff9e6', iconColor: '#f39c12' },
  { id: '3', name: 'Staples', icon: 'basket-outline', color: '#f5ebe6', iconColor: '#d35400' },
  { id: '4', name: 'Snacks &\nBeverages', icon: 'cafe-outline', color: '#ffeaea', iconColor: '#e74c3c' },
  { id: '5', name: 'Instant &\nFrozen Food', icon: 'snow-outline', color: '#e8f7fb', iconColor: '#3498db' },
  { id: '6', name: 'Dry Fruits\n& Nuts', icon: 'nutrition-outline', color: '#f9e8d8', iconColor: '#8B4513' },
  { id: '7', name: 'Personal\nCare', icon: 'fitness-outline', color: '#f5ecfc', iconColor: '#9b59b6' },
  { id: '8', name: 'Household\nItems', icon: 'home-outline', color: '#e0f2f1', iconColor: '#1abc9c' },
  { id: '9', name: 'Baby\nCare', icon: 'heart-outline', color: '#fce4ec', iconColor: '#e91e63' },
  { id: '10', name: 'Pet\nSupplies', icon: 'paw-outline', color: '#f3e5f5', iconColor: '#a87000' },
  { id: '11', name: 'Sweets &\nChocolates', icon: 'star-outline', color: '#fff3e0', iconColor: '#ff6f00' },
];

export default function CategoriesScreen() {
  const router = useRouter();

  const handleCategoryPress = (category: typeof GROCERY_CATEGORIES[0]) => {
    // Navigate to a search or specific category page realistically
    // router.push(`/search?category=${category.name}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>

        {/* Sleek Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={() => router.push('/search')}>
          <Ionicons name="search" size={20} color={theme.onSurfaceVariant} style={styles.searchIcon} />
          <View pointerEvents="none" style={{ flex: 1 }}>
            <TextInput
              placeholder="Search hundreds of categories..."
              placeholderTextColor={theme.onSurfaceVariant}
              style={styles.searchInput}
              editable={false}
            />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={GROCERY_CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.rowStyle}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={32} color={item.iconColor} />
            </View>
            <Text style={styles.categoryName} numberOfLines={2} adjustsFontSizeToFit>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.surfaceLow
  },
  headerTitle: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#000', letterSpacing: -0.5, marginBottom: 15 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLow,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: FontFamily.medium, color: theme.onSurface },

  gridContainer: { padding: 15, paddingBottom: 40 },
  rowStyle: { justifyContent: 'space-between', marginBottom: 25 },

  categoryCard: {
    width: '30%',
    alignItems: 'center',
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  categoryName: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: '#000',
    textAlign: 'center',
    lineHeight: 16
  }
});
