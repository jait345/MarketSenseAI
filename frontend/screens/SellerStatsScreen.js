import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function SellerStatsScreen({ navigation }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/seller/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="stats-chart" size={64} color="#ccc" />
        <Text style={styles.errorText}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estadísticas de Ventas</Text>
        <Text style={styles.headerSubtitle}>Resumen de tu actividad como vendedor</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cube" size={24} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Productos Activos</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cart" size={24} color="#34c759" />
          </View>
          <Text style={styles.statValue}>{stats.totalSales}</Text>
          <Text style={styles.statLabel}>Ventas Totales</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cash" size={24} color="#ff9500" />
          </View>
          <Text style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ingresos Totales</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={24} color="#af52de" />
          </View>
          <Text style={styles.statValue}>{stats.avgPrice.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Precio Promedio</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
        {stats.topProducts.length > 0 ? (
          stats.topProducts.map((product, index) => (
            <View key={product._id} style={styles.topProductCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSales}>{product.purchaseCount} ventas</Text>
                <Text style={styles.productRevenue}>
                  ${(product.purchaseCount * (product.discountPrice || product.price)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No hay productos vendidos aún</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen por Categoría</Text>
        {stats.categoryStats.length > 0 ? (
          stats.categoryStats.map((category) => (
            <View key={category._id} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category._id}</Text>
                <Text style={styles.categoryProducts}>{category.count} productos</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryRevenue}>${category.totalRevenue.toFixed(2)}</Text>
                <Text style={styles.categorySales}>{category.totalSales} ventas</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No hay datos por categoría</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryProducts: {
    fontSize: 12,
    color: '#666',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  categorySales: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});