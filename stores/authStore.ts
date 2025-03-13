import { defineStore } from "pinia";
import { ref } from "vue";

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

  return {
    getAuthUrl,
    setAuthUrl,
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    clearTokens,
  };
});
