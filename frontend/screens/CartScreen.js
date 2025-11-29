import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import Colors from '../assets/colors';
import SafeImage from '../components/SafeImage';


const CartScreen = ({ navigation }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart 
  } = useCart();
  const { user } = useAuth();
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Función para manejar el pago con PayPal
  const saveLocalOrder = async () => {
    try {
      const keyBase = (user?._id) ? user._id : (user?.email || 'guest');
      const storageKey = `orders:${keyBase}`;
      const existing = await AsyncStorage.getItem(storageKey);
      const orders = existing ? JSON.parse(existing) : [];
      const order = {
        _id: String(Date.now()),
        createdAt: new Date().toISOString(),
        totalPrice: getCartTotal(),
        paymentStatus: 'paid',
        orderItems: cartItems.map(ci => ({
          name: ci.name,
          quantity: ci.quantity,
          price: ci.price,
          image: typeof ci.image === 'object' ? ci.image.uri : ci.image,
        }))
      };
      const next = [order, ...orders].slice(0, 50);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const handlePayPalCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito para continuar con la compra');
      return;
    }

    setIsProcessingPayment(true);
    
    // Simulación de procesamiento de pago
    setTimeout(async () => {
      setIsProcessingPayment(false);
      await saveLocalOrder();
      Alert.alert(
        'Pago exitoso', 
        'Tu pedido ha sido procesado correctamente',
        [
          { 
            text: 'Ver mis pedidos', 
            onPress: () => {
              clearCart();
              navigation.navigate('PurchaseHistory');
            }
          },
          { 
            text: 'Seguir comprando', 
            onPress: () => {
              clearCart();
              navigation.navigate('Inicio');
            },
            style: 'cancel'
          },
        ]
      );
    }, 2000);
  };

  // Renderizar cada item del carrito
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <SafeImage 
        source={item.image} 
        style={styles.productImage} 
        fallbackSource={item.localImage || require('../assets/icon.png')}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={Colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mi Carrito" navigation={navigation} />
      
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Envío:</Text>
              <Text style={styles.summaryValue}>$5.00</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTextBold}>Total:</Text>
              <Text style={styles.summaryValueBold}>${getCartTotal().toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handlePayPalCheckout}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Image 
                    source={{ uri: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg' }} 
                    style={styles.paypalLogo} 
                  />
                  <Text style={styles.checkoutButtonText}>Pagar con PayPal</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.continueShoppingText}>Continuar comprando</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.grey} />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Inicio')}
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  summaryTextBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  paypalLogo: {
    width: 37,
    height: 23,
    marginRight: 10,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  continueShoppingText: {
    color: Colors.primary,
    fontSize: 16,
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

export default CartScreen;