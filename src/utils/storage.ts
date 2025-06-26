// src/utils/storage.ts

type StorageType = 'localStorage' | 'sessionStorage';

interface StorageOptions {
  type?: StorageType;
  encrypt?: boolean;
  expiryInMinutes?: number;
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

// User data types
interface UserData {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

// App settings types
interface AppSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: string;
  [key: string]: unknown;
}

class StorageManager {
  private getStorage(type: StorageType): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'localStorage' ? localStorage : sessionStorage;
  }

  private generateKey(key: string): string {
    return `app_${key}`;
  }

  // Simple encryption/decryption (for demo - use proper encryption in production)
  private encrypt(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Fallback to unencrypted data
    }
  }

  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch (error) {
      console.error('Decryption error:', error);
      return data; // Fallback to treating as unencrypted
    }
  }

  private isExpired(item: StorageItem<unknown>): boolean {
    if (!item.expiry) return false;
    return Date.now() > item.expiry;
  }

  // Set item in storage
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const {
        type = 'localStorage',
        encrypt = false,
        expiryInMinutes
      } = options;

      const storage = this.getStorage(type);
      if (!storage) return false;

      const storageItem: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: expiryInMinutes 
          ? Date.now() + (expiryInMinutes * 60 * 1000)
          : undefined
      };

      let dataToStore = JSON.stringify(storageItem);
      
      if (encrypt) {
        dataToStore = this.encrypt(dataToStore);
      }

      storage.setItem(this.generateKey(key), dataToStore);
      return true;
    } catch (error) {
      console.error('Error setting storage item:', error);
      return false;
    }
  }

  // Get item from storage
  get<T>(key: string, options: Pick<StorageOptions, 'type' | 'encrypt'> = {}): T | null {
    try {
      const { type = 'localStorage', encrypt = false } = options;
      const storage = this.getStorage(type);
      if (!storage) return null;

      let data = storage.getItem(this.generateKey(key));
      if (!data) return null;

      if (encrypt) {
        data = this.decrypt(data);
      }

      const storageItem: StorageItem<T> = JSON.parse(data);

      // Check if expired
      if (this.isExpired(storageItem)) {
        this.remove(key, { type });
        return null;
      }

      return storageItem.value;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
    }
  }

  // Remove item from storage
  remove(key: string, options: Pick<StorageOptions, 'type'> = {}): boolean {
    try {
      const { type = 'localStorage' } = options;
      const storage = this.getStorage(type);
      if (!storage) return false;

      storage.removeItem(this.generateKey(key));
      return true;
    } catch (error) {
      console.error('Error removing storage item:', error);
      return false;
    }
  }

  // Clear all app storage items
  clear(options: Pick<StorageOptions, 'type'> = {}): boolean {
    try {
      const { type = 'localStorage' } = options;
      const storage = this.getStorage(type);
      if (!storage) return false;

      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('app_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Check if item exists
  exists(key: string, options: Pick<StorageOptions, 'type'> = {}): boolean {
    const { type = 'localStorage' } = options;
    const storage = this.getStorage(type);
    if (!storage) return false;

    const item = storage.getItem(this.generateKey(key));
    if (!item) return false;

    try {
      const storageItem: StorageItem<unknown> = JSON.parse(item);
      return !this.isExpired(storageItem);
    } catch {
      return false;
    }
  }

  // Get all app keys
  getAllKeys(options: Pick<StorageOptions, 'type'> = {}): string[] {
    try {
      const { type = 'localStorage' } = options;
      const storage = this.getStorage(type);
      if (!storage) return [];

      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('app_')) {
          keys.push(key.replace('app_', ''));
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
}

// Create singleton instance
const storage = new StorageManager();

// Convenience functions for common operations
export const storageUtils = {
  // User data (non-sensitive)
  setUserData: (userData: UserData): boolean => 
    storage.set('user_data', userData, { expiryInMinutes: 24 * 60 }), // 24 hours
  
  getUserData: (): UserData | null => 
    storage.get<UserData>('user_data'),
  
  // Tokens (sensitive)
  setTokens: (accessToken: string, refreshToken: string, expiresIn?: number): boolean => {
    const expiryMinutes = expiresIn ? Math.floor(expiresIn / 60) - 5 : undefined; // 5 min buffer
    const accessResult = storage.set('access_token', accessToken, { encrypt: true, expiryInMinutes: expiryMinutes });
    const refreshResult = storage.set('refresh_token', refreshToken, { encrypt: true });
    return accessResult && refreshResult;
  },
  
  getAccessToken: (): string | null => 
    storage.get<string>('access_token', { encrypt: true }),
  
  getRefreshToken: (): string | null => 
    storage.get<string>('refresh_token', { encrypt: true }),
  
  // Settings
  setSettings: (settings: AppSettings): boolean => 
    storage.set('app_settings', settings),
  
  getSettings: (): AppSettings | null => 
    storage.get<AppSettings>('app_settings'),
  
  // Clear all auth data
  clearAuthData: (): boolean => {
    const accessResult = storage.remove('access_token');
    const refreshResult = storage.remove('refresh_token');
    const userResult = storage.remove('user_data');
    return accessResult && refreshResult && userResult;
  },
  
  // Clear all app data
  clearAllData: (): boolean => storage.clear(),

  // Generic storage methods with proper typing
  setItem: <T>(key: string, value: T, options?: StorageOptions): boolean =>
    storage.set(key, value, options),
  
  getItem: <T>(key: string, options?: Pick<StorageOptions, 'type' | 'encrypt'>): T | null =>
    storage.get<T>(key, options),
  
  removeItem: (key: string, options?: Pick<StorageOptions, 'type'>): boolean =>
    storage.remove(key, options),
  
  itemExists: (key: string, options?: Pick<StorageOptions, 'type'>): boolean =>
    storage.exists(key, options),
  
  getAllKeys: (options?: Pick<StorageOptions, 'type'>): string[] =>
    storage.getAllKeys(options),
};

// Export types for use in other files
export type { UserData, AppSettings, StorageOptions, StorageType };

export default storage;