import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../assets/colors';
import SafeImage from './SafeImage';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onPress }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evitar que se active el onPress del card
    
    // Crear una copia del producto con la imagen correcta
    const productToAdd = {
      ...product,
      image: getImageSource()
    };
    
    addToCart(productToAdd, 1);
  };
  
  // Usar una imagen de respaldo genérica en lugar de intentar cargar imágenes con nombres complejos
  const fallbackImage = require('../assets/icon.png');
  
  // Determinar la fuente de la imagen correctamente
  const getImageSource = () => {
    // Primero intentar usar localImage si está disponible
    if (product.localImage) {
      return product.localImage;
    }
    
    // Si no hay imagen o la ruta contiene caracteres problemáticos, usar fallback
    if (!product.image || 
        (typeof product.image === 'string' && 
         (product.image.includes('assets/') || 
          product.image.includes('(') || 
          product.image.includes(')')))) {
      return fallbackImage;
    }
    return { uri: product.image };
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <SafeImage 
        uri={null}
        style={styles.image} 
        fallbackSource={getImageSource()} 
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.floor(product.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color={Colors.yellow}
                style={styles.star}
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>({product.numReviews || 0})</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{(product.price || 0).toFixed(2)}</Text>
        </View>
        {product.countInStock > 0 ? (
          <Text style={styles.inStock}>En Stock</Text>
        ) : (
          <Text style={styles.outOfStock}>Agotado</Text>
        )}
        <View style={styles.primeContainer}>
          {product.isPrime && (
            <View style={styles.primeTag}>
              <Text style={styles.primeText}>Prime</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.addToCartButton, 
          product.countInStock <= 0 && styles.disabledButton
        ]}
        onPress={handleAddToCart}
        disabled={product.countInStock <= 0}
      >
        <Ionicons name="cart" size={20} color={Colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  disabledButton: {
    backgroundColor: Colors.grey,
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: Colors.white,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.secondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  currency: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  inStock: {
    fontSize: 12,
    color: Colors.success,
    marginBottom: 5,
  },
  outOfStock: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 5,
  },
  primeContainer: {
    marginTop: 5,
  },
  primeTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  primeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ProductCard;