import { defineStore } from "pinia";
import jwtDecode from "jwt-decode";
import AuthGRPC from "~/composable/clients/authGrpcClient";
import type { RefreshTokenResponse } from "~/composable/protobuf/frontend/auth_services";

interface AuthToken {
  exp: number;
  [key: string]: unknown;
}
/**
 * Authentication store that only manages auth-related state
 */
export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string>(localStorage.getItem("accessToken") || "");
  const refreshToken = ref<string>(localStorage.getItem("refreshToken") || "");
  const authUrl = ref<string>("");
  let authGRPC: AuthGRPC | null = null;
  let refreshInterval: NodeJS.Timeout | null = null;

  function getAuthUrl() {
    return authUrl.value;
  }

  function setAuthUrl(url: string): void {
    authUrl.value = url;
  }

  function getAccessToken() {
    return accessToken.value;
  }

  function setAccessToken(token: string): void {
    accessToken.value = token;
    localStorage.setItem("accessToken", token);
  }

  function getRefreshToken(): string {
    return refreshToken.value;
  }

  function setRefreshToken(token: string): void {
    refreshToken.value = token;
    localStorage.setItem("refreshToken", token);
  }

  function clearTokens(): void {
    accessToken.value = "";
    refreshToken.value = "";
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  /**
   * Returns is the stored token is valid, i.e. the user is authenticated.
   * @returns {boolean} Boolean value depending of the token.
   */
  function isValidToken(): boolean {
    if (!accessToken.value) return false;

    try {
      const decodedToken = jwtDecode<AuthToken>(accessToken.value);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  /**
   * Starts the token refresh mechanism, refreshing every 15 seconds.
   */
  function startTokenRefresh(): void {
    if(authGRPC === null){
      authGRPC = AuthGRPC.getInstance(getAuthUrl());
    }
    if (refreshInterval) return; 
    refreshInterval = setInterval(async () => {
      try {
        const currentRefreshToken : string = getRefreshToken();
        if (!currentRefreshToken) {
          //Nothing to refresh
          return;
        }
        const response: RefreshTokenResponse | undefined =  await authGRPC?.refreshToken(currentRefreshToken);
        if(response) {
          setAccessToken(response.accessToken);
          setRefreshToken(response.refreshToken);
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 15000); 
  }

  /**
   * Stops the token refresh mechanism.
   */
  function stopTokenRefresh(): void {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  /**
   * Simulates a call to refresh the access token using the refresh token.
   * Replace this with the actual implementation.
   * @param {string} refreshToken The current refresh token.
   * @returns {Promise<string>} A promise resolving to the new access token.
   */
  async function refreshAccessToken(refreshToken: string): Promise<string> {
    // Simula una chiamata al backend per ottenere un nuovo access token
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("newAccessToken");
      }, 1000); // Simula un ritardo di 1 secondo
    });
  }

  return {
    getAuthUrl,
    setAuthUrl,
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    clearTokens,
    isValidToken,
    startTokenRefresh,
    stopTokenRefresh,
  };
});
