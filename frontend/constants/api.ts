import { Platform } from 'react-native';

const host = process.env.EXPO_PUBLIC_API_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_BASE_URL = `http://${host}:3000/api`;
export const API_URL = API_BASE_URL;