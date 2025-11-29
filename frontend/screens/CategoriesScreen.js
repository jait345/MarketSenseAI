import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';

// Mapa de rutas por categoría principal
const routeMap = {
  'Electrónica': 'Electronics',
  'Ropa': 'Clothing',
  'Hogar': 'HomeGoods',
  'Deportes': 'Sports',
};

const CategoriesScreen = ({ navigation }) => {
  // Categorías de ejemplo
  const categories = [
    {
      id: '1',
      name: 'Electrónica',
      icon: 'phone-portrait-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Smartphones', 'Tablets', 'Laptops', 'Accesorios']
    },
    {
      id: '2',
      name: 'Ropa',
      icon: 'shirt-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Hombre', 'Mujer', 'Niños', 'Deportiva']
    },
    {
      id: '3',
      name: 'Hogar',
      icon: 'home-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Muebles', 'Decoración', 'Cocina', 'Jardín']
    },
    {
      id: '4',
      name: 'Deportes',
      icon: 'football-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Fitness', 'Fútbol', 'Ciclismo', 'Natación']
    },
    {
      id: '5',
      name: 'Belleza',
      icon: 'color-palette-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Maquillaje', 'Cuidado facial', 'Perfumes', 'Cabello']
    },
    {
      id: '6',
      name: 'Juguetess',
      icon: 'game-controller-outline',
      image: 'https://via.placeholder.com/150',
      subcategories: ['Educativos', 'Exterior', 'Videojuegos', 'Peluches']
    }
  ];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => {
        const route = routeMap[item.name];
        if (route) {
          navigation.navigate('MainTabs', { screen: 'Inicio', params: { screen: route } });
        } else {
          navigation.navigate('MainTabs', { screen: 'Inicio', params: { screen: 'Home', params: { category: item.name } } });
        }
      }}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.categoryImage}
      />
      <View style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <Ionicons name={item.icon} size={24} color={Colors.primary} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <View style={styles.subcategoriesContainer}>
          {item.subcategories.map((subcat, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.subcategoryItem}
              onPress={() => {
                const route = routeMap[item.name];
                if (route) {
                  navigation.navigate('MainTabs', { screen: 'Inicio', params: { screen: route, params: { subcategory: subcat } } });
                } else {
                  navigation.navigate('MainTabs', { screen: 'Inicio', params: { screen: 'Home', params: { category: item.name, subcategory: subcat } } });
                }
              }}
            >
              <Text style={styles.subcategoryText}>{subcat}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Categorías" navigation={navigation} />
      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: 15,
  },
  categoryItem: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryContent: {
    padding: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  subcategoriesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subcategoryText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});

export default CategoriesScreen;