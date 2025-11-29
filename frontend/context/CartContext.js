import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);

  // Cargar carrito desde AsyncStorage al iniciar
  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    };
    
    loadCartFromStorage();
  }, []);

  // Guardar carrito en AsyncStorage cuando cambia
  useEffect(() => {
    const saveCartToStorage = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error al guardar el carrito:', error);
      }
    };
    
    saveCartToStorage();
  }, [cartItems]);

  // Añadir producto al carrito
  const addToCart = (product, quantity = 1) => {
    console.log("Añadiendo al carrito:", product);
    
    // Asegurarse de que el producto tenga un ID y una imagen válida
    const productToAdd = {
      ...product,
      id: product.id || Math.random().toString(36).substr(2, 9)
    };
    
    setCartItems(prevItems => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === productToAdd.id || item.name === productToAdd.name
      );
      
      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualizar la cantidad
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Si el producto no existe, añadirlo al carrito
        return [...prevItems, { ...productToAdd, quantity }];
      }
    });
    
    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`);
  };

  // Mostrar notificación
  const showNotification = (message) => {
    setNotification(message);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Obtener cantidad total de productos en el carrito
  const getItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      notification,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      clearCart,
      getItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;