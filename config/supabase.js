// All polyfills are now handled in config/polyfills.js
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for Supabase auth storage
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Your Supabase URL and anon key (you should use environment variables in production)
const supabaseUrl = 'https://xascrjkkrbjnskwcxqah.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc2NyamtrcmJqbnNrd2N4cWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODEwODUsImV4cCI6MjA2Mjc1NzA4NX0.yDxhiDUJOunw8a8lJbY-65AVjAHDTtvPVgtwitorLfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
