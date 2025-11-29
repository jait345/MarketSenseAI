import React, { useEffect } from 'react';
import { View } from 'react-native';

// Entrada desde el Drawer que redirige a la pestaña "Pedidos" dentro del TabNavigator
const OrdersEntry = ({ navigation }) => {
  useEffect(() => {
    // Navega al TabNavigator principal y selecciona la pestaña OrdersTab
    navigation.navigate('Main', { screen: 'OrdersTab' });
  }, [navigation]);

  // No muestra nada, solo actúa como redirección
  return <View />;
};

export default OrdersEntry;