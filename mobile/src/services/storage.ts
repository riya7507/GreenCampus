/**
 * Client Storage Service
 * Provides persistent token and session storage for GreenCampus.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "greencampus_access_token";
const USER_KEY = "greencampus_user";

export const StorageService = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async setUser(userJson: string): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, userJson);
  },

  async getUser(): Promise<string | null> {
    return AsyncStorage.getItem(USER_KEY);
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
