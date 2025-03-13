import jwtDecode from "jwt-decode";
import AuthGRPC from "@/composable/clients/authGrpcClient";
import {
  AuthStatus,
  LoginResponse,
  SignUpResponse,
  type SignUpRequest,
} from "@/composable/protobuf/frontend/auth_services";

interface AuthToken {
  exp: number;
  [key: string]: unknown;
}

/**
 * Service that handles all authentication-related business logic
 */
export class AuthService {
  private authClient: AuthGRPC | null = null;
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  constructor(private authStore: ReturnType<typeof useAuthStore>) {}

  /**
   * Initializes the authentication service
   * @param url - URL for the authentication service
   */
  init(url: string): void {
    if (!url) {
      throw new Error("Authentication URL is required");
    }

    this.authStore.setAuthUrl(url);
    this.initAuth();
  }

  /**
   * Sets up the authentication client
   */
  private initAuth(): void {
    const url = this.authStore.getAuthUrl();
    if (!url) {
      throw new Error("Authentication URL is not set. Call init() first.");
    }

    this.authClient = AuthGRPC.getInstance(url);
  }

  /**
   * Gets the authentication client.
   */
  private getAuthClient(): AuthGRPC {
    if (!this.authClient) {
      this.initAuth();
    }

    return this.authClient!;
  }

  /**
   * Checks if the current access token is valid
   */
  isAuthenticated(): boolean {
    const token = this.authStore.getAccessToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<AuthToken>(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  /**
   * Starts the token refresh interval
   * @param intervalMs - Milliseconds between refresh attempts
   */
  startTokenRefresh(intervalMs: number = 60000): void {
    this.stopTokenRefresh();

    if (this.authStore.getRefreshToken()) {
      this.refreshTimerId = setInterval(() => this.refreshToken(), intervalMs);
    }
  }

  /**
   * Stops the token refresh interval
   */
  stopTokenRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  /**
   * Refreshes the access token using the refresh token
   * @returns {Promise<boolean>} Returns a Promise object with the output of the operations.
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.authStore.getRefreshToken();
    if (!refreshToken) {
      console.warn("Cannot refresh token: No refresh token available");
      return false;
    }

    try {
      const client = this.getAuthClient();
      const response = await client.refreshToken(refreshToken);

      if (!response.accessToken) return false;
      this.authStore.setAccessToken(response.accessToken);

      if (!response.refreshToken) return false;
      this.authStore.setRefreshToken(response.refreshToken);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.logout();
      return false;
    }
  }

  /**
   * Authenticates a user with fiscal code and password
   */
  async login(fiscalCode: string, password: string): Promise<boolean> {
    try {
      const client: AuthGRPC = this.getAuthClient();
      const response: LoginResponse = await client.login(fiscalCode, password);

      if (response.loginStatus !== AuthStatus.SUCCESS) return false;

      this.authStore.setAccessToken(response.accessToken);
      this.authStore.setRefreshToken(response.refreshToken);
      this.startTokenRefresh();
      return true;
    } catch (error: unknown) {
      console.error("Authentication failed:", error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(userData: SignUpRequest): Promise<boolean> {
    try {
      const client = this.getAuthClient();
      const response: SignUpResponse = await client.signUp(
        userData.fiscalCode,
        userData.name,
        userData.surname,
        userData.dateOfBirth as Date,
        userData.phoneNumber,
        userData.email,
        userData.password,
      );
      return response.signUpStatus === AuthStatus.SUCCESS;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Logs the user out
   */
  logout(): void {
    this.authStore.clearTokens();
    this.stopTokenRefresh();
  }

  /**
   * Gets the current JWT for API calls
   */
  getJWT(): string {
    return this.authStore.getAccessToken();
  }
}
