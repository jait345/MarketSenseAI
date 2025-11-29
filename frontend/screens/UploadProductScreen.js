import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../assets/colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const categories = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Otro'
];

const UploadProductScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    discountPercentage: '',
    category: 'Electrónica',
    subcategory: '',
    brand: '',
    countInStock: '',
    image: null,
    hasDiscount: false,
    discountStartDate: '',
    discountEndDate: ''
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para usar la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.countInStock) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    if (formData.hasDiscount && (!formData.discountPrice && !formData.discountPercentage)) {
      Alert.alert('Error', 'Por favor ingresa un precio de descuento o porcentaje');
      return;
    }

    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Agregar todos los campos al FormData
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', {
            uri: formData[key],
            type: 'image/jpeg',
            name: 'product.jpg',
          });
        } else if (key !== 'image' && key !== 'hasDiscount') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Agregar fechas de descuento si aplica
      if (formData.hasDiscount) {
        if (formData.discountStartDate) {
          formDataToSend.append('discountStartDate', formData.discountStartDate);
        }
        if (formData.discountEndDate) {
          formDataToSend.append('discountEndDate', formData.discountEndDate);
        }
      }

      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Éxito',
          'Producto subido exitosamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', data.message || 'Error al subir producto');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión al subir producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Subir Producto" navigation={navigation} />
      
      <View style={styles.content}>
        {/* Imagen del producto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen del Producto</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePickerContent}>
                <Ionicons name="image-outline" size={40} color={Colors.grey} />
                <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.cameraButtonText}>Tomar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre del producto *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Marca"
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción del producto"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Categoría */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          
          <View style={styles.pickerContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonSelected
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Subcategoría (ej: Smartphones, Ropa deportiva)"
            value={formData.subcategory}
            onChangeText={(text) => setFormData({ ...formData, subcategory: text })}
          />
        </View>

        {/* Precio y stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio y Stock</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Precio original *"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Cantidad en stock *"
            value={formData.countInStock}
            onChangeText={(text) => setFormData({ ...formData, countInStock: text })}
            keyboardType="numeric"
          />
        </View>

        {/* Descuento */}
        <View style={styles.section}>
          <View style={styles.discountHeader}>
            <Text style={styles.sectionTitle}>Descuento</Text>
            <Switch
              value={formData.hasDiscount}
              onValueChange={(value) => setFormData({ ...formData, hasDiscount: value })}
              trackColor={{ false: Colors.grey, true: Colors.primary }}
            />
          </View>
          
          {formData.hasDiscount && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Precio con descuento"
                value={formData.discountPrice}
                onChangeText={(text) => setFormData({ ...formData, discountPrice: text })}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Porcentaje de descuento (0-100)"
                value={formData.discountPercentage}
                onChangeText={(text) => setFormData({ ...formData, discountPercentage: text })}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Fecha inicio descuento (YYYY-MM-DD)"
                value={formData.discountStartDate}
                onChangeText={(text) => setFormData({ ...formData, discountStartDate: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Fecha fin descuento (YYYY-MM-DD)"
                value={formData.discountEndDate}
                onChangeText={(text) => setFormData({ ...formData, discountEndDate: text })}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Subir Producto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 10,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cameraButtonText: {
    color: Colors.primary,
    marginLeft: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.grey,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UploadProductScreen;