import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../config/api';

const OrderDetailScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fmtCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const fmtDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const deriveStatus = (o) => {
    if (o?.paymentStatus) return o.paymentStatus;
    if (o?.isPaid) return o.isPaid ? 'paid' : 'pending';
    return 'pending';
  };

  const normalizeItem = (it) => ({
    name: it.name,
    quantity: it.quantity != null ? it.quantity : (it.qty != null ? it.qty : 1),
    price: it.price,
    image: it.image
  });

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/orders/${orderId}`, { method: 'GET', timeoutMs: 10000 });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        const keyBase = (user?._id) ? user._id : (user?.email || 'guest');
        const storageKey = `orders:${keyBase}`;
        const localStr = await AsyncStorage.getItem(storageKey);
        const list = localStr ? JSON.parse(localStr) : [];
        const found = list.find(o => String(o._id) === String(orderId));
        setOrder(found || null);
      }
    } catch (e) {
      const keyBase = (user?._id) ? user._id : (user?.email || 'guest');
      const storageKey = `orders:${keyBase}`;
      const localStr = await AsyncStorage.getItem(storageKey);
      const list = localStr ? JSON.parse(localStr) : [];
      const found = list.find(o => String(o._id) === String(orderId));
      setOrder(found || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      {item.image ? (
        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.itemImage} />
      ) : (
        <View style={styles.itemImagePlaceholder}><Ionicons name="cube-outline" size={22} color={Colors.grey} /></View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemMeta}>x{item.quantity} • {fmtCurrency((item.price || 0))}</Text>
      </View>
      <Text style={styles.itemTotal}>{fmtCurrency((item.price || 0) * (item.quantity || 1))}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalle de Pedido" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalle de Pedido" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.emptyText}>No se encontró el pedido</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(order.orderItems) ? order.orderItems.map(normalizeItem) : [];
  const status = deriveStatus(order);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Detalle de Pedido" navigation={navigation} />
      <View style={styles.headerBox}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>Orden #{String(order._id).slice(-6)}</Text>
          <Text style={styles.orderDate}>{fmtDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (status === 'paid' ? Colors.success : status === 'cancelled' ? Colors.error : Colors.warning) + '20' }]}>
          <Ionicons name={status === 'paid' ? 'checkmark-circle' : status === 'cancelled' ? 'close-circle' : 'time-outline'} size={16} color={status === 'paid' ? Colors.success : status === 'cancelled' ? Colors.error : Colors.warning} />
          <Text style={[styles.statusText, { color: status === 'paid' ? Colors.success : status === 'cancelled' ? Colors.error : Colors.warning }]}>
            {status === 'paid' ? 'Pagado' : status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={(
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmtCurrency(order.totalPrice)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 10, fontSize: 16, color: Colors.textSecondary },
  backButton: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
  backButtonText: { color: Colors.white, fontWeight: '600' },
  headerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15 },
  headerLeft: { flexDirection: 'column' },
  orderId: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  orderDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16 },
  statusText: { marginLeft: 6, fontSize: 12 },
  listContainer: { padding: 15 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.lightBackground, marginRight: 10 },
  itemImagePlaceholder: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.lightBackground, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: Colors.textPrimary },
  itemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  totalLabel: { fontSize: 16, color: Colors.textSecondary },
  totalValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
});

export default OrderDetailScreen;