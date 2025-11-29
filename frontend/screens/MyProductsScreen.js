import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function MyProductsScreen({ navigation }) {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar tus productos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProducts();
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceContainer}>
          {item.discountPrice > 0 ? (
            <>
              <Text style={styles.originalPrice}>${item.price}</Text>
              <Text style={styles.discountPrice}>${item.discountPrice}</Text>
            </>
          ) : (
            <Text style={styles.price}>${item.price}</Text>
          )}
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            <Ionicons name="eye" size={14} color="#666" /> {item.views || 0}
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="cart" size={14} color="#666" /> {item.purchaseCount || 0}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, 
            item.stock > 0 ? styles.inStock : styles.outOfStock
          ]}>
            {item.stock > 0 ? `En stock (${item.stock})` : 'Sin stock'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando tus productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Productos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UploadProduct')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tienes productos aún</Text>
          <Text style={styles.emptySubtext}>
            Presiona el botón + para agregar tu primer producto
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  inStock: {
    backgroundColor: '#34c759',
    color: '#fff',
  },
  outOfStock: {
    backgroundColor: '#ff3b30',
    color: '#fff',
  },
});