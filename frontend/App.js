import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import NotificationToast from './components/NotificationToast';

// Pantallas
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ClothingCategoryScreen from './screens/ClothingCategoryScreen';
import HomeGoodsCategoryScreen from './screens/HomeGoodsCategoryScreen';
import SportsCategoryScreen from './screens/SportsCategoryScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import OrdersScreen from './screens/OrdersScreen';
import ElectronicsCategoryScreen from './screens/ElectronicsCategoryScreen';
import UploadProductScreen from './screens/UploadProductScreen';
import MyProductsScreen from './screens/MyProductsScreen';
import SellerStatsScreen from './screens/SellerStatsScreen';
import PurchaseHistoryScreen from './screens/PurchaseHistoryScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de productos dentro de la pestaña Inicio
function ProductStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Electronics" component={ElectronicsCategoryScreen} />
      <Stack.Screen name="Clothing" component={ClothingCategoryScreen} />
      <Stack.Screen name="HomeGoods" component={HomeGoodsCategoryScreen} />
      <Stack.Screen name="Sports" component={SportsCategoryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Buscar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Carrito') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Login') {
            iconName = focused ? 'log-in' : 'log-in-outline';
          } else if (route.name === 'Registro') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={ProductStack} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="Carrito" component={CartScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Registro" component={RegisterScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="UploadProduct" component={UploadProductScreen} />
            <Stack.Screen name="MyProducts" component={MyProductsScreen} />
            <Stack.Screen name="SellerStats" component={SellerStatsScreen} />
          <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </Stack.Navigator>
          <NotificationToast />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}