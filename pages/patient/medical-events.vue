<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type {
  GetAllMedicalEventResponse,
  GetMedicalExamDetailsResponse,
} from "@/composable/protobuf/frontend/patient_services";
import { formatDateTime } from "@/utils/date-format";
import type { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import PatientGRPC from "~/composable/clients/patientGrpcClient";
import { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";
const { t } = useI18n();
const router = useRouter();
const config = useRuntimeConfig();
const patientGRPC: PatientGRPC = PatientGRPC.getInstance(config.public.patientsUrl);
// const patientGRPC: PatientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);

// Variables for the date range
const from = ref(new Date());
const to = ref(new Date());
to.value.setMonth(to.value.getMonth() - 3); // 3 months ago

// Variables to store medical events and selected event details
const medicalEvents = ref<GetAllMedicalEventResponse | null>(null);
const expandedEventId = ref<number | null>(null); // Tracks the expanded event
const examsDetails = ref<Array<MedicalExam> | null>(null); // Stores exam details

// Function to toggle the expanded state of an event
async function toggleEventDetails(event: MedicalEvent | null): Promise<void> {
  expandedEventId.value = event ? event.eventId : null;

  if (!event) return;

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
    }
  }
}

// Function to navigate to medical exams
function goToMedicalExams(examId: number): void {
  router.push(`/patient/medical-exams?examId=${examId}`);
}

function getMedicalEvents(): void {
  patientGRPC
    .getAllMedicalEvent(from.value, to.value)
    .then((response: GetAllMedicalEventResponse) => {
      medicalEvents.value = response;
    })
    .catch((error) => {
      console.error("Error fetching medical events:", error);
    });
}

onBeforeMount(() => {
  // Set the date range for the medical events
  to.value = new Date(); // Today
  from.value = new Date();
  from.value.setMonth(from.value.getMonth() - 3); // 3 months ago

  // Fetch medical events
  getMedicalEvents();
});
</script>

<template>
  <h1>
    {{ t("medicalEvents") }}
  </h1>
  <v-card class="mb-4" variant="outlined">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-date-picker
            v-model="from"
            :max="to"
            color="primary"
            title="From Date"
            show-adjacent-months
            hide-header
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-date-picker
            v-model="to"
            :min="from"
            :max="new Date().toISOString().slice(0, 10)"
            color="primary"
            title="To Date"
            show-adjacent-months
            hide-header
          />
        </v-col>
        <v-col cols="12" class="text-center mt-4">
          <v-btn color="primary" @click="getMedicalEvents">
            {{ t("fetchEvents") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card variant="flat" class="overflow-y-auto" max-height="400">
    <v-card-text
      v-if="medicalEvents != null && medicalEvents?.medicalEvents?.length > 0"
    >
      <v-timeline align="start" density="compact">
        <v-timeline-item
          v-for="event in medicalEvents.medicalEvents"
          :key="event.eventId"
          size="x-small"
        >
          <div class="mb-4">
            <strong
              >{{
                event.fromDateTime ? formatDateTime(event.fromDateTime) : "#"
              }}
              -
              {{
                event.toDateTime ? formatDateTime(event.toDateTime) : "#"
              }}</strong
            >
            <v-btn
              @click="
                toggleEventDetails(
                  expandedEventId === event.eventId ? null : event,
                )
              "
            >
              <strong>{{
                expandedEventId === event.eventId
                  ? t("hideDetails")
                  : t("inspectEvent")
              }}</strong>
            </v-btn>
          </div>
          <div
            v-if="expandedEventId != null && expandedEventId === event.eventId"
            class="mt-2"
          >
            <p v-if="event.severityCode">
              <strong>{{ t("severityCode") }}:</strong> {{ event.severityCode }}
            </p>
            <p v-if="event.ward">
              <strong>{{ t("ward") }}:</strong> {{ event.ward.name }}
            </p>
            <p v-if="event.dischargeLetter">
              <strong>{{ t("dischargeLetter") }}:</strong>
              {{ event.dischargeLetter }}
            </p>
            <div v-if="event.medicalExamIds?.length > 0">
              <h3>{{ t("relatedExams") }}</h3>
              <v-list>
                <v-list-item v-for="(exam, i) in examsDetails" :key="i">
                  <v-list-item-title>
                    {{ t("examType") }}: {{ exam.examType || t("unknown") }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ t("doctor") }}:
                    {{
                      `${exam.doctor?.user?.name} ${exam.doctor?.user?.surname}`
                    }}
                  </v-list-item-subtitle>
                  <v-btn @click="goToMedicalExams(exam.examId)">
                    {{ t("viewExam") }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
    <v-card-text v-else>{{ t("noMedicalEvents") }}</v-card-text>
  </v-card>
</template>

<style scoped></style>
