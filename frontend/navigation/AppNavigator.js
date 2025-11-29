import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Pantallas
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrdersEntry from '../screens/OrdersEntry';
import ElectronicsCategoryScreen from '../screens/ElectronicsCategoryScreen';
import ClothingCategoryScreen from '../screens/ClothingCategoryScreen';
import HomeGoodsCategoryScreen from '../screens/HomeGoodsCategoryScreen';
import SportsCategoryScreen from '../screens/SportsCategoryScreen';

// Colores
import Colors from '../assets/colors';

// Contexto de autenticación
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Navegador de productos
const ProductNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Electronics" component={ElectronicsCategoryScreen} />
      <Stack.Screen name="Clothing" component={ClothingCategoryScreen} />
      <Stack.Screen name="HomeGoods" component={HomeGoodsCategoryScreen} />
      <Stack.Screen name="Sports" component={SportsCategoryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
};

// Navegador de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Navegador de pestañas
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={ProductNavigator} 
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen} 
        options={{ tabBarLabel: 'Buscar' }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen} 
        options={{ tabBarLabel: 'Carrito' }}
      />
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersScreen} 
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegador de cajón
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textPrimary,
        drawerLabelStyle: {
          marginLeft: -20,
        },
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{
          title: 'Inicio',
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{
          title: 'Categorías',
          drawerIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Orders" 
        component={OrdersEntry} 
        options={{
          title: 'Mis Pedidos',
          drawerIcon: ({ color }) => (
            <Ionicons name="list-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  // Usar el contexto de autenticación para verificar si el usuario está autenticado
  const { isAuthenticated, loading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return null; // Aquí se podría mostrar un componente de carga
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;