import { createChannel, createClient } from "nice-grpc-web";
import {
  AuthServicesDefinition,
  LoginRequest,
  SignUpRequest,
  RefreshTokenRequest,
  type AuthServicesClient,
  LoginResponse,
  SignUpResponse,
  RefreshTokenResponse,
} from "@/composable/protobuf/frontend/auth_services";

/** Class representing authentication services in a singleton pattern. */
export default class AuthGRPC {
  private static instance: AuthGRPC | null = null;
  private readonly grpcConnection: AuthServicesClient;

  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.grpcConnection = this.createGrpcClient(url);
  }

  /**
   * Gets the singleton instance of AuthGRPC.
   * @param {string?} url URL of the gRPC server.
   * @returns {AuthGRPC} The singleton instance.
   */
  public static getInstance(url?: string): AuthGRPC {
    if (!AuthGRPC.instance && !url)
      throw new Error(
        "AuthGRPC has not been initialized, usage: getInstance(url)",
      );
    if (!AuthGRPC.instance && url) {
      AuthGRPC.instance = new AuthGRPC(url);
    }

    // Technically here we're assured that it's instantiated
    // But the compiler is not sure, hence why ! is needed.
    return AuthGRPC.instance!;
  }

  /**
   * This function creates a gRPC connection to a particular url.
   * @param {string} url URL of the gRPC server.
   * @returns {AuthServicesClient} Connection to the gRPC server.
   */
  private createGrpcClient(url: string): AuthServicesClient {
    return createClient(AuthServicesDefinition, createChannel(url));
  }

  /**
   * gRPC request to login the user given some informations
   * @param {string} fiscalCode User's fiscal code.
   * @param {string} password User's password.
   * @returns {Promise<LoginResponse>} Promise object that when fullfilled returns the answer of the server.
   */
  login(fiscalCode: string, password: string): Promise<LoginResponse> {
    return this.grpcConnection.login(
      LoginRequest.create({ fiscalCode, password }),
    );
  }

  /**
   * gRPC request to signup a new user.
   * @param {string} fiscalCode User's fiscal code.
   * @param {string} name User's first name.
   * @param {string} surname User's last name.
   * @param {Date} dateOfBirth User's date of birth.
   * @param {string} phoneNumber User's phone number.
   * @param {string} email User's email address.
   * @param {string} password User's password.
   * @returns {Promise<SignUpResponse>} Promise object that when fulfilled returns the answer of the server.
   */
  signUp(
    fiscalCode: string,
    name: string,
    surname: string,
    dateOfBirth: Date,
    phoneNumber: string,
    email: string,
    password: string,
  ): Promise<SignUpResponse> {
    return this.grpcConnection.signUp(
      SignUpRequest.create({
        fiscalCode,
        name,
        surname,
        dateOfBirth,
        phoneNumber,
        email,
        password,
      }),
    );
  }

  /**
   * gRPC request to refresh the user's authentication token.
   * @param {string} refreshToken Token used to refresh the user's authentication.
   * @returns {Promise<RefreshTokenResponse>} Promise object that when fulfilled returns the new token information from the server.
   */
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.grpcConnection.refreshToken(
      RefreshTokenRequest.create({ refreshToken }),
    );
  }
}
