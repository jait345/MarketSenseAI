import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
let ConstantsModule = null;
try {
  ConstantsModule = require('expo-constants');
} catch {}

const envBase = process.env.EXPO_PUBLIC_API_BASE;

function resolveNativeBase() {
  if (envBase) return envBase;
  const hostUri = ConstantsModule?.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:4000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
}

export const API_BASE = Platform.OS === 'web' ? 'http://localhost:4000' : resolveNativeBase();

export async function getToken() {
  try {
    const token = await AsyncStorage.getItem('token');
    return token || null;
  } catch {
    return null;
  }
}

export async function authFetch(endpoint, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': '1',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}