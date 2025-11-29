import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Colors from '../assets/colors';

const NotificationToast = () => {
  const { notification } = useCart();
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (notification) {
      // Mostrar la notificación
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notification, opacity]);

  if (!notification) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.toast}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        <Text style={styles.message}>{notification}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});

export default NotificationToast;