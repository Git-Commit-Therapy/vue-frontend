<script setup lang="ts">
definePageMeta({
  middleware: "patient",
});
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  GetAllMedicalEventResponse,
  GetMedicalExamDetailsResponse,
} from "@/composable/protobuf/frontend/patient_services";
import { formatDateTime } from "@/utils/date-format";
import type { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import PatientGRPC from "~/composable/clients/patientGrpcClient";
import { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";

const { t } = useI18n();
const config = useRuntimeConfig();
const patientGRPC: PatientGRPC = PatientGRPC.getInstance(
  config.public.patientsUrl,
);

// Variables for the date range - Fixed initialization
const from = ref(new Date());
const to = ref(new Date());
from.value.setMonth(from.value.getMonth() - 3); // 3 months ago (corrected)

// Variables to store medical events and selected event details
const medicalEvents = ref<GetAllMedicalEventResponse | null>(null);
const expandedEventId = ref<number | null>(null);
const examsDetails = ref<Array<MedicalExam> | null>(null);
const loading = ref(false);
const showError = ref<boolean>(false);
const error = ref<string | null>(null);

function hideError() {
  showError.value = false;
}

// Function to toggle the expanded state of an event
async function toggleEventDetails(event: MedicalEvent | null): Promise<void> {
  expandedEventId.value = event ? event.eventId : null;

  if (!event) return;

  loading.value = true;
  examsDetails.value = [];
  console.log(event.medicalExamIds);

  for (const examId of event.medicalExamIds) {
    try {
      const tmp = MedicalExam.create({ examId: examId });
      const response = await patientGRPC.getMedicalExamDetails(tmp);

      if (!response || !response.exam) {
        console.warn(`No exam returned for examId: ${examId}`, response);
        continue;
      }

      examsDetails.value.push(response.exam);
    } catch (err) {
      console.error(`Failed to fetch exam details for examId: ${examId}`, err);
      error.value = t("errorFetchingExamDetails");
      showError.value = true;
    }
  }
  loading.value = false;
}

function getMedicalEvents(): void {
  loading.value = true;
  patientGRPC
    .getAllMedicalEvent(new Date(from.value), new Date(to.value))
    .then((response: GetAllMedicalEventResponse) => {
      medicalEvents.value = response;
    })
    .catch((error) => {
      console.error("Error fetching medical events:", error);
      error.value = t("errorFetchingMedicalEvents");
      showError.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
}

onBeforeMount(() => {
  // Set the date range for the medical events using proper browser local time
  to.value = new Date(); // Today
  from.value = new Date();
  from.value.setMonth(from.value.getMonth() - 3); // 3 months ago

  // Fetch medical events
  getMedicalEvents();
});
</script>

<template>
  <div class="medical-events-container">
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
        >mdi-calendar-heart</v-icon
      >
      <h1 class="page-title">{{ t("medicalEvents") }}</h1>
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
                :max="to"
                color="primary"
                title="From Date"
                show-adjacent-months
                hide-header
                elevation="0"
              />
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="date-picker-wrapper">
              <v-date-picker
                v-model="to"
                :min="from"
                :max="new Date().toISOString().slice(0, 10)"
                color="primary"
                title="To Date"
                show-adjacent-months
                hide-header
                elevation="0"
              />
            </div>
          </v-col>
        </v-row>
        <v-row class="mt-3">
          <v-col cols="12" class="text-center">
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              @click="getMedicalEvents"
              prepend-icon="mdi-refresh"
            >
              {{ t("fetchEvents") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Medical Events Timeline -->
    <v-card class="events-card" elevation="2">
      <v-card-title class="pb-2">
        <v-icon class="mr-2" color="primary">mdi-timeline-clock</v-icon>
        Medical Events Timeline
      </v-card-title>

      <v-card-text v-if="loading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-h6">Loading medical events...</p>
      </v-card-text>

      <v-card-text
        v-else-if="
          medicalEvents != null && medicalEvents?.medicalEvents?.length > 0
        "
        class="timeline-container"
      >
        <v-timeline align="start" density="comfortable" line-color="primary">
          <v-timeline-item
            v-for="event in medicalEvents.medicalEvents"
            :key="event.eventId"
            size="small"
            dot-color="primary"
            fill-dot
          >
            <v-card
              class="event-card"
              elevation="1"
              :class="{ expanded: expandedEventId === event.eventId }"
            >
              <v-card-title class="event-header">
                <div class="event-date-range">
                  <v-icon class="mr-2" size="20" color="primary"
                    >mdi-clock-outline</v-icon
                  >
                  <strong>
                    {{
                      event.fromDateTime
                        ? formatDateTime(event.fromDateTime)
                        : "#"
                    }}
                    <span class="mx-2">→</span>
                    {{
                      event.toDateTime ? formatDateTime(event.toDateTime) : "#"
                    }}
                  </strong>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  :color="
                    expandedEventId === event.eventId ? 'secondary' : 'primary'
                  "
                  variant="outlined"
                  size="small"
                  @click="
                    toggleEventDetails(
                      expandedEventId === event.eventId ? null : event,
                    )
                  "
                  :prepend-icon="
                    expandedEventId === event.eventId
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                >
                  {{
                    expandedEventId === event.eventId
                      ? t("hideDetails")
                      : t("inspectEvent")
                  }}
                </v-btn>
              </v-card-title>

              <v-expand-transition>
                <v-card-text
                  v-if="
                    expandedEventId != null && expandedEventId === event.eventId
                  "
                  class="event-details"
                >
                  <v-row>
                    <v-col cols="12" md="6">
                      <div v-if="event.severityCode" class="detail-item">
                        <v-chip color="warning" variant="outlined" class="mb-2">
                          <v-icon start>mdi-alert-circle</v-icon>
                          {{ t("severityCode") }}: {{ event.severityCode }}
                        </v-chip>
                      </div>
                      <div v-if="event.ward" class="detail-item">
                        <v-chip color="info" variant="outlined" class="mb-2">
                          <v-icon start>mdi-hospital-building</v-icon>
                          {{ t("ward") }}: {{ event.ward.name }}
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div v-if="event.dischargeLetter" class="detail-item">
                        <v-card variant="outlined" class="discharge-letter">
                          <v-card-title class="text-subtitle-1">
                            <v-icon class="mr-2">mdi-file-document</v-icon>
                            {{ t("dischargeLetter") }}
                          </v-card-title>
                          <v-card-text class="discharge-text">
                            {{ event.dischargeLetter }}
                          </v-card-text>
                        </v-card>
                      </div>
                    </v-col>
                  </v-row>

                  <div
                    v-if="event.medicalExamIds?.length > 0"
                    class="related-exams mt-4"
                  >
                    <v-divider class="mb-4"></v-divider>
                    <h4 class="mb-3">
                      <v-icon class="mr-2" color="primary"
                        >mdi-clipboard-pulse</v-icon
                      >
                      {{ t("relatedExams") }}
                    </h4>

                    <div v-if="loading" class="text-center py-4">
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="32"
                      ></v-progress-circular>
                    </div>

                    <v-row v-else>
                      <v-col
                        v-for="(exam, i) in examsDetails"
                        :key="i"
                        cols="12"
                        md="6"
                        lg="4"
                      >
                        <v-card class="exam-card" variant="outlined" hover>
                          <v-card-title class="text-subtitle-1">
                            <v-icon class="mr-2" color="primary"
                              >mdi-stethoscope</v-icon
                            >
                            {{ exam.examType || t("unknown") }}
                          </v-card-title>
                          <v-card-text>
                            <div class="doctor-info">
                              <v-icon class="mr-2" size="16">mdi-doctor</v-icon>
                              <span class="text-body-2">
                                {{
                                  `${exam.doctor?.user?.name} ${exam.doctor?.user?.surname}`
                                }}
                              </span>
                            </div>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn
                              color="primary"
                              variant="text"
                              prepend-icon="mdi-eye"
                              @click="$emit('viewExam', exam.examId)"
                            >
                              {{ t("viewExam") }}
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-expand-transition>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-card-text v-else class="no-events">
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-calendar-remove</v-icon>
          <h3 class="mt-4 text-h6 text-grey">{{ t("noMedicalEvents") }}</h3>
          <p class="text-body-2 text-grey">Try adjusting your date range</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.medical-events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.timeline-container {
  max-height: 600px;
  overflow-y: auto;
}

.event-date-range {
  display: flex;
  align-items: center;
}

.doctor-info {
  display: flex;
  align-items: center;
}
</style>
