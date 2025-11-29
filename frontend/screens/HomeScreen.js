import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeImage from '../components/SafeImage';

const HomeScreen = ({ navigation }) => {
  const [categories] = useState([
    { id: '1', name: 'Electrónica', icon: 'laptop-outline' },
    { id: '2', name: 'Ropa', icon: 'shirt-outline' },
    { id: '3', name: 'Hogar', icon: 'home-outline' },
    { id: '4', name: 'Deportes', icon: 'football-outline' }
  ]);
  
  const routeMap = {
    'Electrónica': 'Electronics',
    'Ropa': 'Clothing',
    'Hogar': 'HomeGoods',
    'Deportes': 'Sports',
  };
  


  const [featuredProducts] = useState([
    {
    id: '1',
    name: 'Auriculares Bluetooth',
    localImage: require('../assets/auriculares.png'),
    price: 99.99,
    },
    {
      id: '2',
      name: 'Honor 400 Smartphone',
      localImage: require('../assets/honorsmarph.png'),
      price: 599.99,
    },
    {
      id: '3',
      name: 'Juego de Mesa',
      localImage: require('../assets/juegomesaharry.png'),
      price: 299.99,
    },
    {
      id: '4',
      name: 'Consola de Videojuegos',
      localImage: require('../assets/consolavideo.png'),
      price: 499.99,
    },
  ]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => {
        const route = routeMap[item.name];
        if (route) {
          navigation.navigate(route);
        } else {
          navigation.navigate('Home', { category: item.name });
        }
      }}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <SafeImage source={item.localImage} uri={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Simple */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MarketSense AI</Text>
        <Ionicons name="search-outline" size={24} color="#000" />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categorías */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <SafeImage 
            source={require('../assets/portada.png')}  
            style={styles.bannerImage} 
            resizeMode={'cover'}
          />
        </View>
        {/* Productos destacados */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <FlatList
            data={featuredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        {/* Oferta del día */}
        <View style={styles.dealContainer}>
          <Text style={styles.dealTitle}>Oferta del Día</Text>
          <View style={styles.dealContent}>
            <SafeImage 
              source={require('../assets/smartv50pul.png')} 
              style={styles.dealImage} 
            />
            <View style={styles.dealInfo}>
              <Text style={styles.dealName}>Smart TV 55" 4K</Text>
              <Text style={styles.dealPrice}>$539.99</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d17711ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 70,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#b9b7b7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  bannerContainer: {
    padding: 15,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  heroContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    width: 150,
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 14,
    marginTop: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dealContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 8,
    padding: 15,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dealContent: {
    flexDirection: 'row',
  },
  dealImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  dealInfo: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  dealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5252',
  },
});

export default HomeScreen;