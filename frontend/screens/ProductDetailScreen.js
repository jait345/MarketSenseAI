import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';
import SafeImage from '../components/SafeImage';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const isShoes = product?.sizeType === 'shoes';
  const [selectedGroup, setSelectedGroup] = useState(isShoes ? 'Adulto' : null);
  const initialSizes = isShoes ? (selectedGroup === 'Niño' ? (product.sizesKid || product.sizes || []) : (product.sizesAdult || product.sizes || [])) : (product.sizes || []);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(initialSizes.length > 0 ? initialSizes[0] : null);

  const incrementQuantity = () => {
    if (quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const sizesToShow = () => {
    if (isShoes) {
      return selectedGroup === 'Niño' ? (product.sizesKid || []) : (product.sizesAdult || []);
    }
    return product.sizes || [];
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} showBack={true} showSearch={false} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imágenes del producto */}
        <View style={styles.imageContainer}>
          <SafeImage uri={product.image} fallbackSource={product.localImage || require('../assets/icon.png')} style={styles.productImage} />
        </View>
        
        {/* Información del producto */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          
          {/* Valoraciones */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color={Colors.yellow}
                  style={styles.star}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => console.log('Ver reseñas')}>
              <Text style={styles.reviewCount}>{product.numReviews} valoraciones</Text>
            </TouchableOpacity>
          </View>
          
          {/* Precio */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>{product.price.toFixed(2)}</Text>
            </View>
            {product.isPrime && (
              <View style={styles.primeTag}>
                <Text style={styles.primeText}>Prime</Text>
              </View>
            )}
          </View>
          
          {/* Disponibilidad */}
          {product.countInStock > 0 ? (
            <Text style={styles.inStock}>En Stock</Text>
          ) : (
            <Text style={styles.outOfStock}>Agotado</Text>
          )}
          
          {/* Descripción */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Descripción:</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
          {/* Selector de tallas (ropa/tenis) */}
          {Array.isArray(sizesToShow()) && sizesToShow().length > 0 && (
            <View style={styles.sizeContainer}>
              <Text style={styles.sizeTitle}>Tallas:</Text>
              {isShoes && (
                <View style={styles.sizeGroupTabs}>
                  {['Niño', 'Adulto'].map((grp) => (
                    <TouchableOpacity
                      key={grp}
                      style={[styles.sizeGroupTab, selectedGroup === grp && styles.sizeGroupTabActive]}
                      onPress={() => {
                        setSelectedGroup(grp);
                        const s = grp === 'Niño' ? (product.sizesKid || []) : (product.sizesAdult || []);
                        setSelectedSize(s.length ? s[0] : null);
                      }}
                    >
                      <Text style={[styles.sizeGroupTabText, selectedGroup === grp && styles.sizeGroupTabTextActive]}>{grp}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.sizeChips}>
                {sizesToShow().map((size) => (
                  <TouchableOpacity
                    key={String(size)}
                    style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                    onPress={() => setSelectedSize(size)}
                  >
                    {product.sizeType === 'clothing' ? (
                      <Ionicons name="shirt-outline" size={16} color={selectedSize === size ? Colors.white : Colors.textPrimary} />
                    ) : (
                      <Ionicons name="footsteps-outline" size={16} color={selectedSize === size ? Colors.white : Colors.textPrimary} />
                    )}
                    <Text style={[styles.sizeChipText, selectedSize === size && styles.sizeChipTextActive]}>{String(size)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {/* Selector de cantidad */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Cantidad:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]} 
                onPress={decrementQuantity}
                disabled={quantity === 1}
              >
                <Ionicons name="remove" size={20} color={quantity === 1 ? Colors.grey : Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity === product.countInStock && styles.quantityButtonDisabled]} 
                onPress={incrementQuantity}
                disabled={quantity === product.countInStock}
              >
                <Ionicons name="add" size={20} color={quantity === product.countInStock ? Colors.grey : Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.addToCartButton]}
            onPress={() => console.log('Añadir al carrito')}
          >
            <Ionicons name="cart" size={20} color={Colors.textPrimary} />
            <Text style={styles.addToCartText}>Añadir al carrito</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buyNowButton]}
            onPress={() => console.log('Comprar ahora')}
          >
            <Text style={styles.buyNowText}>Comprar ahora</Text>
          </TouchableOpacity>
        </View>
        
        {/* Productos relacionados */}
        <View style={styles.relatedContainer}>
          <Text style={styles.relatedTitle}>Productos relacionados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity key={item} style={styles.relatedItem}>
                <SafeImage 
                  uri={`https://via.placeholder.com/150/FFFFFF?text=Producto+${item}`} 
                  style={styles.relatedImage} 
                />
                <Text style={styles.relatedName} numberOfLines={2}>Producto relacionado {item}</Text>
                <Text style={styles.relatedPrice}>$99.99</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Espacio adicional al final */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: width - 40,
    height: 300,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    marginTop: 10,
  },
  brand: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  primeTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 10,
  },
  primeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  inStock: {
    fontSize: 14,
    color: Colors.success,
    marginBottom: 10,
  },
  outOfStock: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 10,
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sizeContainer: {
    marginBottom: 15,
  },
  sizeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  sizeGroupTabs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sizeGroupTab: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  sizeGroupTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeGroupTabText: {
    color: Colors.textPrimary,
  },
  sizeGroupTabTextActive: {
    color: Colors.white,
  },
  sizeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeChipText: {
    marginLeft: 6,
    color: Colors.textPrimary,
  },
  sizeChipTextActive: {
    color: Colors.white,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginRight: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  actionContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    marginTop: 10,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: Colors.yellowLight,
    borderWidth: 1,
    borderColor: Colors.yellow,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addToCartText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buyNowButton: {
    backgroundColor: Colors.primary,
  },
  buyNowText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  relatedContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    marginTop: 10,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  relatedItem: {
    width: 120,
    marginRight: 15,
  },
  relatedImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  relatedName: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  bottomSpace: {
    height: 20,
  },
});

export default ProductDetailScreen;