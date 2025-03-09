import { createChannel, createClient } from "nice-grpc-web";
import {
  AuthServicesDefinition,
  LoginRequest,
  SignUpRequest,
  RefreshTokenRequest,
} from "./protobuf/auth_services";

const createGrpcClient = (url) => {
  const channel = createChannel(url);
  return createClient(AuthServicesDefinition, channel);
};

export const login = async (url, fiscalCode, password) => {
  const client = createGrpcClient(url);
  const request = LoginRequest.create({ fiscalCode, password });
  return await client.login(request);
};

export const signUp = async (
  url,
  fiscalCode,
  name,
  surname,
  dateOfBirth,
  phoneNumber,
  email,
  password,
) => {
  const client = createGrpcClient(url);
  const request = SignUpRequest.create({
    fiscalCode,
    name,
    surname,
    dateOfBirth,
    phoneNumber,
    email,
    password,
  });
  return await client.signUp(request);
};

export const refreshToken = async (url, refreshToken) => {
  const client = createGrpcClient(url);
  const request = RefreshTokenRequest.create({ refreshToken });
  return await client.refreshToken(request);
};
