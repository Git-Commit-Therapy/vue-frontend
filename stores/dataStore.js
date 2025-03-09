import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getPatient,
  getAppointments,
  getAllMedicalInfo,
  getAllMedicalEvent,
  getAllMedicalExam,
  getMedicalExamDetails,
} from "@/composable/patientGrpcClient";

export const useDataStore = defineStore("dataStore", () => {
  const authUrl = ref("");
  const backendUrl = ref("");

  const patientData = ref({});
  const nameSurname = ref("");

  const init = async () => {
    try {
      const response = await fetch("/config.json");
      const data = await response.json();
      authUrl.value = data.authUrl;
      backendUrl.value = data.backendUrl;
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const initPatientData = async () => {
    try {
      const patientData = await fetchPatient();
      const medicalInfo = await fetchAllMedicalInfo();
      patientData.value.patient = patientData;
      patientData.value.medicalInfo = medicalInfo;
      nameSurname.value =
        patientData.value.patient.user.name +
        " " +
        patientData.value.patient.user.surname;
    } catch (error) {
      console.error("Error initializing patient data:", error);
    }
  };

  const fetchPatient = async () => {
    return await getPatient(backendUrl.value);
  };

  const fetchAppointments = async (fromDate, toDate) => {
    return await getAppointments(backendUrl.value, fromDate, toDate);
  };

  const fetchAllMedicalInfo = async () => {
    return await getAllMedicalInfo(backendUrl.value);
  };

  const fetchAllMedicalEvent = async (fromDate, toDate) => {
    return await getAllMedicalEvent(backendUrl.value, fromDate, toDate);
  };

  const fetchAllMedicalExam = async (fromDate, toDate) => {
    return await getAllMedicalExam(backendUrl.value, fromDate, toDate);
  };

  const fetchMedicalExamDetails = async (exam) => {
    return await getMedicalExamDetails(backendUrl.value, exam);
  };

  return {
    authUrl,
    backendUrl,
    patientData,
    nameSurname,
    init,
    initPatientData,
    fetchPatient,
    fetchAppointments,
    fetchAllMedicalInfo,
    fetchAllMedicalEvent,
    fetchAllMedicalExam,
    fetchMedicalExamDetails,
  };
});
