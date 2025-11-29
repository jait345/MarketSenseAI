import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';

const OrdersScreen = ({ navigation }) => {
  // Órdenes de ejemplo
  const [orders, setOrders] = useState([
    {
      _id: '1',
      createdAt: '2023-05-15T10:30:00Z',
      totalPrice: 234.99,
      isPaid: true,
      paidAt: '2023-05-15T10:35:00Z',
      isDelivered: true,
      deliveredAt: '2023-05-18T14:20:00Z',
      orderItems: [
        {
          name: 'Zapatos Deportivos Nike Air',
          qty: 1,
          image: 'https://via.placeholder.com/150',
          price: 129.99,
          product: '1'
        },
        {
          name: 'Camiseta Deportiva Adidas',
          qty: 2,
          image: 'https://via.placeholder.com/150',
          price: 34.99,
          product: '3'
        }
      ]
    },
    {
      _id: '2',
      createdAt: '2023-06-02T15:45:00Z',
      totalPrice: 89.99,
      isPaid: true,
      paidAt: '2023-06-02T15:50:00Z',
      isDelivered: false,
      deliveredAt: null,
      orderItems: [
        {
          name: 'Auriculares Bluetooth Sony',
          qty: 1,
          image: 'https://via.placeholder.com/150',
          price: 89.99,
          product: '2'
        }
      ]
    },
    {
      _id: '3',
      createdAt: '2023-06-10T09:15:00Z',
      totalPrice: 164.97,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      orderItems: [
        {
          name: 'Camiseta Deportiva Adidas',
          qty: 3,
          image: 'https://via.placeholder.com/150',
          price: 34.99,
          product: '3'
        },
        {
          name: 'Botella de Agua Deportiva',
          qty: 2,
          image: 'https://via.placeholder.com/150',
          price: 29.99,
          product: '4'
        }
      ]
    }
  ]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getOrderStatus = (order) => {
    if (order.isDelivered) {
      return { 
        label: 'Entregado', 
        color: Colors.success,
        icon: 'checkmark-circle'
      };
    } else if (order.isPaid) {
      return { 
        label: 'En camino', 
        color: Colors.warning,
        icon: 'bicycle'
      };
    } else {
      return { 
        label: 'Pendiente de pago', 
        color: Colors.error,
        icon: 'time'
      };
    }
  };

  const renderOrderItem = ({ item }) => {
    const status = getOrderStatus(item);
    
    return (
      <TouchableOpacity 
        style={styles.orderItem}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderDate}>
              Pedido del {formatDate(item.createdAt)}
            </Text>
            <Text style={styles.orderId}>
              ID: {item._id}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderProducts}>
          <FlatList
            data={item.orderItems}
            keyExtractor={(product) => product.product}
            renderItem={({ item: product }) => (
              <View style={styles.productItem}>
                <View style={styles.productImagePlaceholder}>
                  <Ionicons name="cube-outline" size={24} color={Colors.grey} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productMeta}>
                    {product.qty} x ${product.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalItems}>
            {item.orderItems.reduce((acc, item) => acc + item.qty, 0)} productos
          </Text>
          <Text style={styles.totalPrice}>
            Total: ${item.totalPrice.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
            <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Ver detalles</Text>
          </TouchableOpacity>
          
          {!item.isPaid && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="card-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Pagar ahora</Text>
            </TouchableOpacity>
          )}
          
          {item.isDelivered && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="repeat-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Comprar de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mis Pedidos" navigation={navigation} />
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.grey} />
          <Text style={styles.emptyText}>No tienes pedidos</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopButtonText}>Ir a comprar</Text>
          </TouchableOpacity>
        </View>
      )}
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
  orderItem: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  orderId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  orderProducts: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 15,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  productMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 15,
    marginTop: 5,
  },
  totalItems: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  orderActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OrdersScreen;
