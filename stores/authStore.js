import { defineStore } from "pinia";
import { ref } from "vue";
import jwtDecode from "jwt-decode";
import { useDataStore } from "@/stores/dataStore";
import {
  login,
  refreshToken as grpcRefreshToken,
  signUp,
} from "@/composable/authGrpcClient";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(null);
  const refreshTokenValue = ref(null);
  let refreshInterval = null;

  const setToken = (newToken) => {
    token.value = newToken;
    startTokenRefresh();
  };

  const setRefreshToken = (newRefreshToken) => {
    refreshTokenValue.value = newRefreshToken;
  };

  const clearToken = () => {
    token.value = null;
    refreshTokenValue.value = null;
    stopTokenRefresh();
  };

  const isAuthenticated = () => {
    if (!token.value) return false;
    try {
      const decodedToken = jwtDecode(token.value);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const refreshToken = async () => {
    const dataStore = useDataStore();
    if (!dataStore.authUrl) {
      await dataStore.init();
    }

    if (!dataStore.authUrl) {
      throw new Error("Authentication URL is not set");
    }

    try {
      const response = await grpcRefreshToken(
        dataStore.authUrl,
        refreshTokenValue.value,
      );
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearToken();
    }
  };

  const startTokenRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshToken, 15 * 1000); // Refresh every 15 seconds
  };

  const stopTokenRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
  };

  const authenticate = async (fiscalCode, password) => {
    const dataStore = useDataStore();

    if (!dataStore.authUrl) {
      await dataStore.init();
    }

    if (!dataStore.authUrl) {
      throw new Error("Authentication URL is not set");
    }

    try {
      const response = await login(dataStore.authUrl, fiscalCode, password);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    }
  };

  const signUp = async (
    fiscalCode,
    name,
    surname,
    dateOfBirth,
    phoneNumber,
    email,
    password,
  ) => {
    const dataStore = useDataStore();

    if (!dataStore.authUrl) {
      await dataStore.init();
    }

    if (!dataStore.authUrl) {
      throw new Error("Authentication URL is not set");
    }

    try {
      const response = await signUp(
        dataStore.authUrl,
        fiscalCode,
        name,
        surname,
        dateOfBirth,
        phoneNumber,
        email,
        password,
      );
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
    } catch (error) {
      console.error("SignUp failed:", error);
      throw error;
    }
  };

  return {
    token,
    setToken,
    clearToken,
    isAuthenticated,
    refreshToken,
    authenticate,
    signUp,
  };
});
