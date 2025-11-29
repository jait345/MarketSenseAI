import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../config/api';

const ProfileScreen = ({ navigation }) => {
  const { user, token, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {}
  });

  // Debug: Check token and user data
  console.log('ProfileScreen - User:', user);
  console.log('ProfileScreen - Token:', token);

  // Test token validation
  const testToken = async () => {
    if (!token) {
      console.log('No token available for testing');
      return;
    }
    
    try {
      const response = await authFetch('/api/auth/profile', {
        method: 'GET'
      });
      
      console.log('Token test response:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Token test error:', errorData);
      }
    } catch (error) {
      console.error('Token test error:', error);
    }
  };

  // Test token on component mount
  React.useEffect(() => {
    if (token) {
      testToken();
    }
  }, [token]);

  const handleChangeRole = async (newRole) => {
    if (newRole === user.role) return;
    setIsLoading(true);
    try {
      const call = async (endpoint) => {
        const res = await authFetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole }),
          timeoutMs: 10000
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${res.status}`);
        }
        return res;
      };

      let response;
      try {
        response = await call('/api/auth/change-role');
      } catch {
        try {
          response = await call('/api/users/change-role');
        } catch {
          response = await call('/api/auth/role');
        }
      }

      const data = await response.json().catch(() => ({ user: { ...user, role: newRole } }));
      await updateUser(data.user || { ...user, role: newRole });
      Alert.alert(
        'Éxito',
        `Ahora eres ${newRole === 'seller' ? 'vendedor' : 'comprador'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const updated = { ...user, role: newRole };
      await updateUser(updated);
      Alert.alert('Modo sin conexión', `Rol cambiado localmente a ${newRole === 'seller' ? 'vendedor' : 'comprador'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    setIsLoading(true);
    try {
      // Debug: Check if token exists
      console.log('Token:', token);
      console.log('Form data:', formData);
      
      const response = await authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Response:', response.status, data);
      
      if (response.ok) {
        await updateUser(data.user);
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Error de conexión al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', onPress: logout }
      ]
    );
  };

  const renderRoleSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mi Rol</Text>
      <View style={styles.roleContainer}>
        <View style={styles.roleInfo}>
          <Ionicons 
            name={user?.role === 'seller' ? 'storefront-outline' : 'person-outline'} 
            size={24} 
            color={Colors.primary} 
          />
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleText}>
              {user?.role === 'seller' ? 'Vendedor' : 'Comprador'}
            </Text>
            <Text style={styles.roleDescription}>
              {user?.role === 'seller' 
                ? 'Puedes subir y vender productos' 
                : 'Puedes comprar productos de otros vendedores'
              }
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.changeRoleButton}
          onPress={() => {
            const newRole = user?.role === 'seller' ? 'buyer' : 'seller';
            Alert.alert(
              'Cambiar Rol',
              `¿Quieres cambiar a ${newRole === 'seller' ? 'vendedor' : 'comprador'}?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sí', onPress: () => handleChangeRole(newRole) }
              ]
            );
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.changeRoleButtonText}>
              Cambiar a {user?.role === 'seller' ? 'Comprador' : 'Vendedor'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      {isEditing ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Calle"
            value={formData.address.street || ''}
            onChangeText={(text) => setFormData({
              ...formData, 
              address: {...formData.address, street: text}
            })}
          />
          <TextInput
            style={styles.input}
            placeholder="Ciudad"
            value={formData.address.city || ''}
            onChangeText={(text) => setFormData({
              ...formData, 
              address: {...formData.address, city: text}
            })}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.grey} />
            <Text style={styles.infoText}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.grey} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          {user?.phone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={Colors.grey} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderBuyerSection = () => {
    if (user?.role !== 'buyer') return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Compras</Text>
        
        <TouchableOpacity
          style={styles.sellerButton}
          onPress={() => navigation.navigate('PurchaseHistory')}
        >
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
          <Text style={styles.sellerButtonText}>Historial de Compras</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSellerSection = () => {
    if (user?.role !== 'seller') return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Herramientas de Vendedor</Text>
        
        <TouchableOpacity
          style={styles.sellerButton}
          onPress={() => navigation.navigate('UploadProduct')}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.sellerButtonText}>Subir Producto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sellerButton}
          onPress={() => navigation.navigate('MyProducts')}
        >
          <Ionicons name="cube-outline" size={24} color={Colors.primary} />
          <Text style={styles.sellerButtonText}>Mis Productos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sellerButton}
          onPress={() => navigation.navigate('SellerStats')}
        >
          <Ionicons name="stats-chart-outline" size={24} color={Colors.primary} />
          <Text style={styles.sellerButtonText}>Estadísticas</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Perfil" navigation={navigation} />
      
      <View style={styles.content}>
        {renderRoleSection()}
        {renderProfileSection()}
        {renderBuyerSection()}
        {renderSellerSection()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  roleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changeRoleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  changeRoleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: Colors.background,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colors.grey,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  sellerButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5252',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProfileScreen;