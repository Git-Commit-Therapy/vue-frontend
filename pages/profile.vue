<script setup lang="ts">
import { Patient } from "@/composable/protobuf/frontend/user";
import PatientGRPC from "@/composable/clients/patientGrpcClient";
import type { MedicalInfo } from "@/composable/protobuf/frontend/medical_info";
const { t } = useI18n();
const patientGRPC: PatientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);
const patient = ref<Patient>();
const medicalInfo = ref<MedicalInfo[]>([]);
const nameSurname = ref<string>("");
onBeforeMount(async () => {
  try {
    const res = await patientGRPC.getPatient();
    patient.value = res;
    nameSurname.value = res.user ? `${res.user.name} ${res.user.surname}` : "";

    const allInfo = await patientGRPC.getAllMedicalInfo();
    medicalInfo.value = allInfo.medicalInfo;
  } catch (error) {
    console.error("Error fetching patient data:", error);
  }
});
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
