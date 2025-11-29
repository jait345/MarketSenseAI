import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import SafeImage from '../components/SafeImage';
import { API_BASE, authFetch } from '../config/api';

// API_BASE ahora se obtiene de configuración centralizada

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useTokenLogin, setUseTokenLogin] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert('Ingresa email y contraseña');
        return;
      }
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        timeoutMs: 12000
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error iniciando sesión' }));
        alert(err.message || 'Error iniciando sesión');
        return;
      }
      const data = await res.json();
      
      // Store token and user data
      if (data.token && data.user) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        alert('Sesión iniciada correctamente');
        navigation.navigate('Perfil');
      } else {
        alert('Error: Respuesta inválida del servidor');
      }
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red al iniciar sesión';
      alert(msg);
    }
  };

  const handleForgot = async () => {
    try {
      if (!email) {
        alert('Ingresa tu email para recuperar la contraseña');
        return;
      }
      const res = await authFetch('/api/users/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({ message: 'Error generando token de recuperación' }));
      if (!res.ok) {
        alert(data.message || 'Error generando token de recuperación');
        return;
      }
      const msg = data.token
        ? `Token de recuperación (solo desarrollo):\n${data.token}\nExpira: ${data.expiresAt}`
        : (data.message || 'Si el email existe, se enviará un token');
      alert(msg);
    } catch (e) {
      alert('Error de red al solicitar recuperación');
    }
  };

  const handleTokenLogin = async () => {
    try {
      if (!resetToken) {
        alert('Ingresa el token de recuperación');
        return;
      }
      const res = await authFetch('/api/users/login-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: resetToken.trim() })
      });
      const data = await res.json().catch(() => ({ message: 'Error iniciando con token' }));
      if (!res.ok) {
        alert(data.message || 'Token inválido o expirado');
        return;
      }
      await AsyncStorage.setItem('user', JSON.stringify(data));
      alert('Sesión iniciada con token');
      navigation.navigate('Perfil');
    } catch (e) {
      alert('Error de red al iniciar con token');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <SafeImage uri={'https://via.placeholder.com/150x50?text=LOGO'} style={styles.logo} />
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgot}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tokenToggle} onPress={() => setUseTokenLogin(!useTokenLogin)}>
            <Text style={styles.tokenToggleText}>{useTokenLogin ? 'Usar email y contraseña' : '¿Tienes un token? Iniciar con token'}</Text>
          </TouchableOpacity>

          {useTokenLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Token de recuperación</Text>
              <TextInput
                style={styles.input}
                placeholder="Pega tu token aquí"
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleTokenLogin}
              >
                <Text style={styles.loginButtonText}>Iniciar con token</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!useTokenLogin && (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 50,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  tokenToggle: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tokenToggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;