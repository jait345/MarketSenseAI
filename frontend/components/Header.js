import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../assets/colors';

const Header = ({ navigation, title, showSearch = true, showBack = false }) => {
  const handleHomePress = () => {
    // Navigate to the main tabs and reset to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleCartPress = () => {
    // Navigate to cart screen through the tab navigator
    navigation.navigate('MainTabs', { screen: 'Carrito' });
  };

  const handleProfilePress = () => {
    // Navigate to profile screen through the tab navigator
    navigation.navigate('MainTabs', { screen: 'Perfil' });
  };

  return (
    <View style={styles.header}>
      <View style={styles.topBar}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleHomePress} style={styles.menuButton}>
            <Ionicons name="home" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleHomePress}>
          <Text style={styles.logo}>TiendaIA</Text>
        </TouchableOpacity>
        
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
            <Ionicons name="cart" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfilePress} style={styles.iconButton}>
            <Ionicons name="person" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={Colors.grey}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  menuButton: {
    padding: 5,
  },
  logo: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.textPrimary,
  },
  micButton: {
    padding: 5,
  },
});

export default Header;