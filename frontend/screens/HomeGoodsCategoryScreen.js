import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Colors from '../assets/colors';
import ProductCard from '../components/ProductCard';
import { homeGoodsProducts } from '../data/products';

const HomeGoodsCategoryScreen = ({ navigation }) => {
  const products = useMemo(() => homeGoodsProducts, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Hogar" navigation={navigation} />
      <View style={styles.listContainer}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
        />
      </View>
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
});

export default HomeGoodsCategoryScreen;