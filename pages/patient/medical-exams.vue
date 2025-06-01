<script setup lang="ts">
definePageMeta({
  middleware: "patient",
});

import { ref, onBeforeMount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import PatientGRPC from "~/composable/clients/patientGrpcClient";
import type { GetAllMedicalExamResponse } from "@/composable/protobuf/frontend/patient_services";
import { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";
import { formatDateTime } from "@/utils/date-format";

const { t } = useI18n();
const route = useRoute();

const from = ref<Date>();
const to = ref<Date>();
const medicalExams = ref<MedicalExam[]>([]);
const selectedExamId = ref<number | null>(null);
const examDetails = ref<MedicalExam | null>(null);

const error = ref("");
const showError = ref(false);

const config = useRuntimeConfig();
const patientGRPC = PatientGRPC.getInstance(config.public.patientsUrl);
// const patientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);

// Load exams
async function loadMedicalExams(): Promise<void> {
  try {
    const response: GetAllMedicalExamResponse =
      await patientGRPC.getAllMedicalExam(from.value, to.value);
    medicalExams.value = response.medicalExams;
  } catch (err: any) {
    error.value = t("errorFetchingExams");
    showError.value = true;
    console.error("Error fetching medical exams:", err);
  }
}

// Load exam details
async function loadExamDetails(examId: number): Promise<void> {
  selectedExamId.value = examId;
  examDetails.value = null;
  try {
    const tempExam = MedicalExam.create({ examId });
    const response = await patientGRPC.getMedicalExamDetails(tempExam);
    examDetails.value = response.exam || null;
  } catch (err: any) {
    error.value = t("errorFetchingExamDetails", { id: examId });
    showError.value = true;
    console.error(`Error fetching details for exam ID ${examId}:`, err);
  }
}

watch(selectedExamId, (newId) => {
  if (newId !== null) loadExamDetails(newId);
  else examDetails.value = null;
});

onBeforeMount(async () => {
  to.value = new Date();
  from.value = new Date();
  from.value.setMonth(from.value.getMonth() - 3);

  await loadMedicalExams();

  const examIdFromRoute = parseInt(route.query.examId as string, 10);
  if (!isNaN(examIdFromRoute)) {
    selectedExamId.value = examIdFromRoute;
  }
});

// This function again is a workaround for not being able to set values inside
// @click...
function setShowError(val: boolean) {
  showError.value = val;
}
</script>

<template>
  <h1>{{ t("medicalExams") }}</h1>

  <v-card class="mb-4" variant="outlined">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-date-picker
            v-model="from"
            :title="t('fromDate')"
            :max="to"
            :display-mode="'static'"
            @update:modelValue="loadMedicalExams"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-date-picker
            v-model="to"
            :title="t('toDate')"
            :min="from"
            :max="new Date()"
            :display-mode="'static'"
            @update:modelValue="loadMedicalExams"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <div v-if="!selectedExamId">
    <v-card variant="flat" class="overflow-y-auto" max-height="400">
      <v-card-text v-if="medicalExams.length > 0">
        <v-list>
          <v-list-item
            v-for="exam in medicalExams"
            :key="exam.examId"
            @click="selectedExamId = exam.examId"
            link
          >
            <v-list-item-title>
              {{ exam.examType || t("unknown") }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="exam.dateTime">
              {{ t("dateTime") }}: {{ formatDateTime(exam.dateTime) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-text v-else>
        {{ t("noMedicalExams") }}
      </v-card-text>
    </v-card>
  </div>

  <div v-else-if="examDetails">
    <h2>{{ t("examDetails") }}</h2>
    <v-card variant="outlined">
      <v-card-text>
        <p v-if="examDetails.examType">
          <strong>{{ t("examType") }}:</strong> {{ examDetails.examType }}
        </p>
        <p v-if="examDetails.dateTime">
          <strong>{{ t("dateTime") }}:</strong>
          {{ formatDateTime(examDetails.dateTime) }}
        </p>
        <p v-if="examDetails.medicalReport">
          <strong>{{ t("medicalReport") }}:</strong>
          {{ examDetails.medicalReport }}
        </p>
        <div v-if="examDetails.doctor">
          <strong>{{ t("doctor") }}:</strong>
          {{ examDetails.doctor.user?.name }}
          {{ examDetails.doctor.user?.surname }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="selectedExamId = null">{{ t("backToExamList") }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>

  <div v-else>
    <p>{{ t("loadingExamDetails") }}</p>
  </div>

  <v-snackbar v-model="showError" color="error" :timeout="5000">
    {{ error }}
    <template v-slot:actions>
      <v-btn icon="mdi-close" @click="setShowError(false)" />
    </template>
  </v-snackbar>
</template>
