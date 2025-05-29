<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  GetAppointmentsFromDoctorRequest,
  GetAppointmentsFromDoctorResponse,
} from "~/composable/protobuf/frontend/employee_services";
import type { Appointment } from "~/composable/protobuf/frontend/appointment";
import { Doctor } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

import { useRouter } from "vue-router";

const router = useRouter();

const editAppointment = (appt: Appointment) => {
  localStorage.setItem("currentAppointment", JSON.stringify(appt));
  router.push(`/doctor/edit/appointment/${appt.appointmentId}`);
};

const { t } = useI18n();
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const loading = ref<boolean>(false);
const appointments = ref<Appointment[]>([]);
const currentDoctor = ref<Doctor>();
const now = new Date();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const fetchAppointments = async () => {
  loading.value = true;
  const req: GetAppointmentsFromDoctorRequest = {
    doctor: currentDoctor.value,
    fromDate: fromDate.value ?? undefined,
    toDate: toDate.value ?? undefined,
  };

  try {
    const response: GetAppointmentsFromDoctorResponse =
      await employeeGRPC.getAppointmentFromDoctor(req);
    appointments.value = response.appointments;
  } catch (err) {
    console.error("Failed to fetch appointments", err);
  } finally {
    loading.value = false;
  }
};

const canEdit = (date: string | Date) => new Date(date) > now;
</script>

<template>
  <div class="p-4 space-y-4">
    <VCard>
      <VCardTitle>{{ t("searchAppointments") }}</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="fetchAppointments">
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

    <div v-if="appointments.length">
      <VCard
        v-for="appt in appointments"
        :key="appt.appointmentId"
        class="my-2"
      >
        <VCardTitle>
          {{ appt.patient?.user?.name }} {{ appt.patient?.user?.surname }} —
          {{ appt.dateTime }}
        </VCardTitle>
        <VCardActions>
          <VBtn
            v-if="canEdit(appt.dateTime!)"
            color="warning"
            @click="editAppointment(appt)"
          >
            {{ t("edit") }}
          </VBtn>
          <span v-else>{{ t("pastAppointment") }}</span>
        </VCardActions>
      </VCard>
    </div>
  </div>
</template>
