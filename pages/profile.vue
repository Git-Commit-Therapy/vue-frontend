<script setup lang="ts">
import { Patient } from "@/composable/protobuf/frontend/user";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, type Router } from "vue-router";
import AuthGRPC from "@/composable/clients/authGrpcClient";
import PatientGRPC from "@/composable/clients/patientGrpcClient";
import type { GetMedicalInfoResponse } from "@/composable/protobuf/frontend/patient_services";
import type { MedicalInfo } from "@/composable/protobuf/frontend/medical_info";
const authStore = useAuthStore();
const router: Router = useRouter();
const { t } = useI18n();
// const patientGRPC: PatientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);
// const patient: Patient = await patientGRPC.getPatient();
const patient: Patient = {
  user: {
    id: "USR001",
    name: "John",
    surname: "Doe",
    birthDate: new Date("1985-07-12"),
    phoneNumber: "+1-555-123-4567",
    email: "john.doe@example.com",
  },
};
// const medicalInfo: GetMedicalInfoResponse =
//   await patientGRPC.getAllMedicalInfo();
const medicalInfo: MedicalInfo[] = [
  {
    medicalInfoId: 1,
    patient: {
      user: {
        id: "USR001",
        name: "John",
        surname: "Doe",
        birthDate: new Date("1985-07-12"),
        phoneNumber: "+1-555-123-4567",
        email: "john.doe@example.com",
      },
    },
    description: "Type 2 Diabetes diagnosed in 2018",
  },
  {
    medicalInfoId: 2,
    patient: {
      user: {
        id: "USR002",
        name: "Emma",
        surname: "Wilson",
        birthDate: new Date("1992-03-25"),
        phoneNumber: "+1-555-987-6543",
        email: "emma.wilson@example.com",
      },
    },
    description: "Seasonal allergies - pollen, dust",
  },
  {
    medicalInfoId: 3,
    patient: {
      user: {
        id: "USR003",
        name: "Michael",
        surname: "Brown",
        birthDate: new Date("1978-11-04"),
        phoneNumber: "+1-555-456-7890",
        email: "michael.brown@example.com",
      },
    },
    description: "Hypertension, requires regular monitoring",
  },
];
const nameSurname: string = patient.user!.name + " " + patient.user!.surname;
</script>

<template>
  <div>
    <h1>{{ t("profile") }}</h1>

    <!-- TODO: do not use this as a trick for a bold line -->
    <v-card variant="outlined"></v-card>
    <v-card variant="flat" class="overflow-y-auto" max-height="400">
      <v-card-item>
        <v-card-title>{{ nameSurname }} </v-card-title>
      </v-card-item>
      <v-card-item>
        <v-btn
          prepend-icon="mdi-calendar-month"
          @click="navigateTo('/patient/appointments')"
          >{{ t("appointments") }}</v-btn
        >
      </v-card-item>
      <v-card-text>
        <v-timeline align="start" density="compact">
          <v-timeline-item
            v-for="info in medicalInfo"
            :key="info.medicalInfoId"
            size="x-small"
          >
            <div class="mb-4">
              <strong>{{ info.description }}</strong>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped></style>
