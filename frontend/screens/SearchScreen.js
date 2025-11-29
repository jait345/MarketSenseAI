import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { API_BASE, authFetch } from '../config/api';
import ProductCard from '../components/ProductCard';
import Colors from '../assets/colors';
import { allProducts } from '../data/products';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'zapatos deportivos', 'camisetas', 'auriculares bluetooth'
  ]);
  const [useAI, setUseAI] = useState(true);

  // Productos de ejemplo para demostración
  const demoProducts = [
    {
      _id: '1',
      name: 'Zapatos Deportivos Nike Air',
      image: 'https://via.placeholder.com/150',
      price: 129.99,
      rating: 4.5,
      numReviews: 120,
      countInStock: 15
    },
    {
      _id: '2',
      name: 'Auriculares Bluetooth Sony',
      image: 'https://via.placeholder.com/150',
      price: 89.99,
      rating: 4.2,
      numReviews: 98,
      countInStock: 8
    },
    {
      _id: '3',
      name: 'Camiseta Deportiva Adidas',
      image: 'https://via.placeholder.com/150',
      price: 34.99,
      rating: 4.0,
      numReviews: 75,
      countInStock: 20
    }
  ];

  const normalizeProduct = (item) => ({
    id: item._id || item.id || String(item.name || Math.random()),
    name: item.name || 'Producto',
    image: item.image,
    localImage: null,
    price: (item.discountPrice && item.discountPrice > 0) ? item.discountPrice : (item.price || 0),
    rating: item.rating || item.avgRating || 0,
    numReviews: item.numReviews || item.reviewsCount || 0,
    countInStock: item.countInStock || item.stock || item.count || 0,
    brand: item.brand || '',
    description: item.description || '',
    category: item.category || item.mainCategory || 'Otros',
  });

  const offlineSearch = (q) => {
    const term = q.trim().toLowerCase();
    return allProducts
      .filter(p =>
        ((p.name || '').toLowerCase().includes(term)) ||
        ((p.brand || '').toLowerCase().includes(term)) ||
        ((p.description || '').toLowerCase().includes(term))
      )
      .map(normalizeProduct);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await authFetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        timeoutMs: 8000
      });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      const mapped = arr.map(normalizeProduct);
      setSearchResults(mapped.length ? mapped : offlineSearch(searchQuery));
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev].slice(0, 5));
      }
    } catch (e) {
      setSearchResults(offlineSearch(searchQuery));
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRecentSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const res = await authFetch(`/api/products?search=${encodeURIComponent(query.trim())}`, {
        method: 'GET',
        timeoutMs: 8000
      });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      const mapped = arr.map(normalizeProduct);
      setSearchResults(mapped.length ? mapped : offlineSearch(query));
    } catch (e) {
      setSearchResults(offlineSearch(query));
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    // Aquí iría la implementación de búsqueda por voz
    alert('Búsqueda por voz no implementada');
  };

  const renderRecentSearches = () => {
    if (searchResults.length > 0) return null;
    
    return (
      <View style={styles.recentSearchesContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Búsquedas recientes</Text>
          {recentSearches.length > 0 && (
            <TouchableOpacity onPress={() => setRecentSearches([])}>
              <Text style={styles.clearText}>Borrar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {recentSearches.length > 0 ? (
          recentSearches.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentItem}
              onPress={() => handleRecentSearch(item)}
            >
              <Ionicons name="time-outline" size={20} color={Colors.grey} />
              <Text style={styles.recentItemText}>{item}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.grey} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noRecentText}>No hay búsquedas recientes</Text>
        )}
      </View>
    );
  };

  const groupByCategory = (items) => {
    const grouped = {};
    items.forEach((it) => {
      const cat = it.category || 'Otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(it);
    });
    return grouped;
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando productos...</Text>
        </View>
      );
    }
    
    if (searchResults.length > 0) {
      const grouped = groupByCategory(searchResults);
      const order = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Otros'];
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {searchResults.length} resultados para "{searchQuery}"
          </Text>
          {order.filter(cat => grouped[cat]).map((cat) => (
            <View key={cat} style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>{cat}</Text>
              <FlatList
                data={grouped[cat]}
                keyExtractor={(item) => item.id || item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.hCard}>
                    <View style={styles.hThumb}>
                      <ProductCard 
                        product={item} 
                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          ))}
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Búsqueda" navigation={navigation} showBack={false} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={Colors.grey} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleVoiceSearch}>
              <Ionicons name="mic-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.aiToggleContainer}>
          <Text style={styles.aiToggleText}>Búsqueda con IA</Text>
          <TouchableOpacity 
            style={[
              styles.aiToggle, 
              useAI ? styles.aiToggleActive : styles.aiToggleInactive
            ]}
            onPress={() => setUseAI(!useAI)}
          >
            <View style={[
              styles.aiToggleCircle,
              useAI ? styles.aiToggleCircleRight : styles.aiToggleCircleLeft
            ]} />
          </TouchableOpacity>
        </View>
        
        {useAI && (
          <View style={styles.aiInfoContainer}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.aiInfoText}>
              La búsqueda con IA entiende el contexto y encuentra productos similares aunque no contengan exactamente las palabras que buscas
            </Text>
          </View>
        )}
      </View>
      
      {renderRecentSearches()}
      {renderSearchResults()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  aiToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  aiToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  aiToggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  aiToggleActive: {
    backgroundColor: Colors.primary,
  },
  aiToggleInactive: {
    backgroundColor: Colors.grey,
  },
  aiToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  aiToggleCircleLeft: {
    alignSelf: 'flex-start',
  },
  aiToggleCircleRight: {
    alignSelf: 'flex-end',
  },
  aiInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  aiInfoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  recentSearchesContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 15,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 14,
    color: Colors.primary,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  noRecentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  hCard: {
    width: 220,
    marginRight: 12,
  },
  hThumb: {
    width: '100%',
  },
});

export default SearchScreen;