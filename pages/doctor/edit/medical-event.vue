<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Doctor } from "~/composable/protobuf/frontend/user";
import {
  GetMedicalEventsFromDoctorRequest,
  GetMedicalEventsFromDoctorResponse,
} from "~/composable/protobuf/frontend/employee_services";

const router = useRouter();
const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const loading = ref(false);
const events = ref<MedicalEvent[]>([]);
const currentDoctor = ref<Doctor>();
const now = new Date();

const fetchEvents = async () => {
  loading.value = true;
  const req: GetMedicalEventsFromDoctorRequest = {
    doctor: currentDoctor.value,
    fromDate: fromDate.value ?? undefined,
    toDate: toDate.value ?? undefined,
  };

  try {
    const res: GetMedicalEventsFromDoctorResponse =
      await employeeGRPC.getMedicalEventsFromDoctor(req);
    events.value = res.medicalEvents;
  } catch (err) {
    console.error("Failed to fetch medical events", err);
  } finally {
    loading.value = false;
  }
};

const canEdit = (date: string | Date) => new Date(date) > now;

const editEvent = (event: MedicalEvent) => {
  localStorage.setItem("currentMedicalEvent", JSON.stringify(event));
  router.push(`/doctor/edit/medical-event/${event.medicalEventId}`);
};
</script>

<template>
  <div class="p-4 space-y-4">
    <VCard>
      <VCardTitle>{{ t("searchMedicalEvents") }}</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="fetchEvents">
          <VRow>
            <VCol cols="12" md="6">
              <VDatePicker v-model="fromDate" label="From date" />
            </VCol>
            <VCol cols="12" md="6">
              <VDatePicker v-model="toDate" label="To date" />
            </VCol>
          </VRow>
          <VBtn :loading="loading" type="submit" color="primary">
            {{ t("search") }}
          </VBtn>
        </VForm>
      </VCardText>
    </VCard>

    <div v-if="events.length">
      <VCard v-for="event in events" :key="event.medicalEventId" class="my-2">
        <VCardTitle>
          {{ event.patient?.user?.name }} {{ event.patient?.user?.surname }} —
          {{ event.eventDate }}
        </VCardTitle>
        <VCardActions>
          <VBtn
            v-if="canEdit(event.eventDate!)"
            color="warning"
            @click="editEvent(event)"
          >
            {{ t("edit") }}
          </VBtn>
          <span v-else>{{ t("pastEvent") }}</span>
        </VCardActions>
      </VCard>
    </div>
  </div>
</template>
