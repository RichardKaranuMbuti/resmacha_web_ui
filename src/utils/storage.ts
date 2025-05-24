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
    return btoa(encodeURIComponent(data));
  }

  private decrypt(data: string): string {
    return decodeURIComponent(atob(data));
  }

  private isExpired(item: StorageItem<any>): boolean {
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
      const storageItem: StorageItem<any> = JSON.parse(item);
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
  setUserData: (userData: any) => 
    storage.set('user_data', userData, { expiryInMinutes: 24 * 60 }), // 24 hours
  
  getUserData: () => 
    storage.get('user_data'),
  
  // Tokens (sensitive)
  setTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => {
    const expiryMinutes = expiresIn ? Math.floor(expiresIn / 60) - 5 : undefined; // 5 min buffer
    storage.set('access_token', accessToken, { encrypt: true, expiryInMinutes: expiryMinutes });
    storage.set('refresh_token', refreshToken, { encrypt: true });
  },
  
  getAccessToken: () => 
    storage.get<string>('access_token', { encrypt: true }),
  
  getRefreshToken: () => 
    storage.get<string>('refresh_token', { encrypt: true }),
  
  // Settings
  setSettings: (settings: any) => 
    storage.set('app_settings', settings),
  
  getSettings: () => 
    storage.get('app_settings'),
  
  // Clear all auth data
  clearAuthData: () => {
    storage.remove('access_token');
    storage.remove('refresh_token');
    storage.remove('user_data');
  },
  
  // Clear all app data
  clearAllData: () => storage.clear(),
};

export default storage;