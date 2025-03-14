import { defineStore } from "pinia";
import jwtDecode from "jwt-decode";
import { ref } from "vue";

interface AuthToken {
  exp: number;
  [key: string]: unknown;
}
/**
 * Authentication store that only manages auth-related state
 */
export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string>("");
  const refreshToken = ref<string>("");
  const authUrl = ref<string>("");

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
  }

  function getRefreshToken() {
    return refreshToken.value;
  }

  function setRefreshToken(token: string): void {
    refreshToken.value = token;
  }

  function clearTokens(): void {
    accessToken.value = "";
    refreshToken.value = "";
  }

  /**
   * Returns is the stored token is valid, i.e. the user is authenticated.
   * @returns {boolean} Boolean value depending of the token.
   */
  function isValidToken(): boolean {
    if (accessToken.value === "") return false;

    try {
      const decodedToken = jwtDecode<AuthToken>(accessToken.value);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
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
  };
});
