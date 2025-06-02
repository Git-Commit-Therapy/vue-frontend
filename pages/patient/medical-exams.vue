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

// Fixed date initialization
const from = ref<Date>();
const to = ref<Date>();
const medicalExams = ref<MedicalExam[]>([]);
const selectedExamId = ref<number | null>(null);
const examDetails = ref<MedicalExam | null>(null);
const loading = ref(false);

const error = ref("");
const showError = ref(false);

const config = useRuntimeConfig();
const patientGRPC = PatientGRPC.getInstance(config.public.patientsUrl);

function hideError() {
  showError.value = false;
}

// Load exams
async function loadMedicalExams(): Promise<void> {
  loading.value = true;
  try {
    const response: GetAllMedicalExamResponse =
      await patientGRPC.getAllMedicalExam(from.value, to.value);
    medicalExams.value = response.medicalExams;
  } catch (err: any) {
    error.value = t("errorFetchingExams");
    showError.value = true;
    console.error("Error fetching medical exams:", err);
  } finally {
    loading.value = false;
  }
}

// Load exam details
async function loadExamDetails(examId: number): Promise<void> {
  selectedExamId.value = examId;
  examDetails.value = null;
  loading.value = true;
  try {
    const tempExam = MedicalExam.create({ examId });
    const response = await patientGRPC.getMedicalExamDetails(tempExam);
    examDetails.value = response.exam!;
  } catch (err: any) {
    error.value = t("errorFetchingExamDetails");
    showError.value = true;
    console.error(`Error fetching details for exam ID ${examId}:`, err);
  } finally {
    loading.value = false;
  }
}

watch(selectedExamId, (newId) => {
  if (newId !== null) loadExamDetails(newId);
  else examDetails.value = null;
});

onBeforeMount(async () => {
  // Fixed date initialization - from is 3 months ago, to is today
  to.value = new Date();
  from.value = new Date();
  from.value.setMonth(from.value.getMonth() - 3);

  await loadMedicalExams();

  const examIdFromRoute = parseInt(route.query.examId as string, 10);
  if (!isNaN(examIdFromRoute)) {
    selectedExamId.value = examIdFromRoute;
  }
});
</script>

<template>
  <div class="medical-exams-container">
    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      location="top right"
    >
      {{ error }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="hideError"></v-btn>
      </template>
    </v-snackbar>

    <!-- Header Section -->
    <div class="header-section">
      <v-icon class="header-icon" size="32" color="primary"
        >mdi-clipboard-pulse</v-icon
      >
      <h1 class="page-title">{{ t("medicalExams") }}</h1>
    </div>

    <!-- Date Range Selector -->
    <v-card class="date-selector-card" elevation="2">
      <v-card-title class="pb-2">
        <v-icon class="mr-2" color="primary">mdi-calendar-range</v-icon>
        Select Date Range
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="date-picker-wrapper">
              <v-date-picker
                v-model="from"
                :title="t('fromDate')"
                :max="to"
                color="primary"
                show-adjacent-months
                hide-header
                elevation="0"
                @update:modelValue="loadMedicalExams"
              />
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="date-picker-wrapper">
              <v-date-picker
                v-model="to"
                :title="t('toDate')"
                :min="from"
                :max="new Date()"
                color="primary"
                show-adjacent-months
                hide-header
                elevation="0"
                @update:modelValue="loadMedicalExams"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Exam List View -->
    <div v-if="!selectedExamId">
      <v-card class="exams-list-card" elevation="2">
        <v-card-title class="pb-2">
          <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
          Medical Exams List
        </v-card-title>

        <v-card-text v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">Loading medical exams...</p>
        </v-card-text>

        <v-card-text v-else-if="medicalExams.length > 0" class="exams-list">
          <v-list class="py-0">
            <v-list-item
              v-for="exam in medicalExams"
              :key="exam.examId"
              @click="selectedExamId = exam.examId"
              class="exam-list-item"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" variant="tonal">
                  <v-icon>mdi-stethoscope</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ exam.examType || t("unknown") }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="exam.dateTime" class="exam-datetime">
                <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                {{ formatDateTime(exam.dateTime) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon color="primary">mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-text v-else class="no-exams">
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1"
              >mdi-clipboard-remove</v-icon
            >
            <h3 class="mt-4 text-h6 text-grey">{{ t("noMedicalExams") }}</h3>
            <p class="text-body-2 text-grey">{{ t("adjustRange") }}</p>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Exam Details View -->
    <div v-else-if="examDetails">
      <v-card class="exam-details-card" elevation="2">
        <v-card-title class="exam-details-header">
          <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
          {{ t("examDetails") }}
        </v-card-title>

        <v-card-text class="exam-details-content">
          <v-row>
            <v-col cols="12" md="6">
              <div v-if="examDetails.examType" class="detail-item">
                <v-chip color="primary" variant="outlined" class="mb-3">
                  <v-icon start>mdi-clipboard-pulse</v-icon>
                  {{ examDetails.examType }}
                </v-chip>
              </div>

              <div v-if="examDetails.dateTime" class="detail-item">
                <v-chip color="info" variant="outlined" class="mb-3">
                  <v-icon start>mdi-calendar-clock</v-icon>
                  {{ formatDateTime(examDetails.dateTime) }}
                </v-chip>
              </div>

              <div v-if="examDetails.doctor" class="detail-item">
                <v-chip color="success" variant="outlined" class="mb-3">
                  <v-icon start>mdi-doctor</v-icon>
                  {{ examDetails.doctor.user?.name }}
                  {{ examDetails.doctor.user?.surname }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div v-if="examDetails.medicalReport" class="medical-report">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                    {{ t("medicalReport") }}
                  </v-card-title>
                  <v-card-text class="report-text">
                    {{ examDetails.medicalReport }}
                  </v-card-text>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="selectedExamId = null"
          >
            {{ t("backToExamList") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Loading State for Exam Details -->
    <div v-else-if="loading">
      <v-card class="loading-card" elevation="2">
        <v-card-text class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-h6">{{ t("loadingExamDetails") }}</p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.medical-exams-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.date-picker-wrapper {
  display: flex;
  justify-content: center;
}

.exams-list {
  max-height: 500px;
  overflow-y: auto;
}

.exam-list-item {
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.exam-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.exam-datetime {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.detail-item {
  margin-bottom: 12px;
}

.medical-report {
  height: 100%;
}

.report-text {
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
}

.exam-details-header {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%
  );
}
</style>
