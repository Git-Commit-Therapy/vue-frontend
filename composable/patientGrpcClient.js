import { createChannel, createClient, Metadata } from "nice-grpc-web";
import {
  PatientServicesDefinition,
  GetAppointmentsRequest,
  GetAllMedicalEventRequest,
  GetAllMedicalExamRequest,
} from "./protobuf/patient_services";
import { MedicalExam } from "./protobuf/medical_exam";
import { useAuthStore } from "@/stores/authStore";

const getMetadata = () => {
  const authStore = useAuthStore();
  const token = authStore.jwt; // Assuming the JWT is stored in the auth store
  if (!token) {
    throw new Error("JWT is missing");
  }
  const metadata = new Metadata();
  metadata.set("Authorization", `Bearer ${token}`);
  return metadata;
};

const createGrpcClient = (url) => {
  const channel = createChannel(url);
  return createClient(PatientServicesDefinition, channel);
};

export const getPatient = async (url) => {
  const client = createGrpcClient(url);
  return await client.getPatient({}, { metadata: getMetadata() });
};

export const getAppointments = async (url, fromDate, toDate) => {
  const client = createGrpcClient(url);
  const request = GetAppointmentsRequest.create({ fromDate, toDate });
  return await client.getAppointments(request, { metadata: getMetadata() });
};

export const getAllMedicalInfo = async (url) => {
  const client = createGrpcClient(url);
  return await client.getAllMedicalInfo({}, { metadata: getMetadata() });
};

export const getAllMedicalEvent = async (url, fromDate, toDate) => {
  const client = createGrpcClient(url);
  const request = GetAllMedicalEventRequest.create({ fromDate, toDate });
  return await client.getAllMedicalEvent(request, { metadata: getMetadata() });
};

export const getAllMedicalExam = async (url, fromDate, toDate) => {
  const client = createGrpcClient(url);
  const request = GetAllMedicalExamRequest.create({ fromDate, toDate });
  return await client.getAllMedicalExam(request, { metadata: getMetadata() });
};

export const getMedicalExamDetails = async (url, exam) => {
  const client = createGrpcClient(url);
  const request = MedicalExam.create({ exam });
  return await client.getMedicalExamDetails(request, {
    metadata: getMetadata(),
  });
};
