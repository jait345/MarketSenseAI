import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../config/api';

const PurchaseHistoryScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await authFetch('/api/orders/my-orders', {
        method: 'GET',
        timeoutMs: 10000
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const localKey = (user?._id) ? user._id : (user?.email || 'guest');
        const localOrdersStr = await AsyncStorage.getItem(`orders:${localKey}`);
        const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
        setOrders(localOrders);
      }
    } catch (error) {
      const localKey = (user?._id) ? user._id : (user?.email || 'guest');
      const localOrdersStr = await AsyncStorage.getItem(`orders:${localKey}`);
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      setOrders(localOrders);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return Colors.success;
      case 'pending': return Colors.warning;
      case 'cancelled': return Colors.error;
      default: return Colors.grey;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Orden #{item._id.slice(-6)}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.paymentStatus) }]}>
          {getStatusText(item.paymentStatus)}
        </Text>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      
      <View style={styles.itemsContainer}>
        {item.orderItems.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {orderItem.name} x{orderItem.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(orderItem.price * orderItem.quantity)}
            </Text>
          </View>
        ))}
        {item.orderItems.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.orderItems.length - 2} productos más
          </Text>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(item.totalPrice)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Historial de Compras" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Historial de Compras" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.grey} />
          <Text style={styles.emptyTitle}>No hay compras</Text>
          <Text style={styles.emptyText}>
            Aún no has realizado ninguna compra. ¡Explora nuestros productos!
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Ir a Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Historial de Compras" navigation={navigation} />
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={fetchOrders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default PurchaseHistoryScreen;