<script setup lang="ts">
import PatientGRPC from "@/composable/clients/patientGrpcClient";
// import env from "@/utils/env";
import type { GetAppointmentsResponse } from "@/composable/protobuf/frontend/employee_services";
import { formatDateTime } from "@/utils/date-format";
const { t } = useI18n();
// const patientGRPC: PatientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);
const config = useRuntimeConfig();
const patientGRPC: PatientGRPC = PatientGRPC.getInstance(config.public.patientsUrl);
const patientAppointments = ref<GetAppointmentsResponse>();
onBeforeMount(async () => {
  patientAppointments.value = await patientGRPC.getAppointments();
});
</script>

<template>
  <h1>
    {{ t("appointments") }}
  </h1>
  <v-card variant="outlined"></v-card>
  <v-card variant="flat" class="overflow-y-auto" max-height="400">
    <v-card-text
      v-if="patientAppointments && patientAppointments.appointments.length > 0"
    >
      <v-timeline align="start" density="compact">
        <v-timeline-item
          v-for="appointment in patientAppointments.appointments"
          :key="appointment.appointmentId"
          size="x-small"
        >
          <div class="mb-4">
            <strong
              >{{ formatDateTime(appointment.dateTime!) }} @
              {{ appointment.doctor?.user?.name }}
              {{ appointment.doctor?.user?.surname }},
              {{ appointment.doctor?.ward?.name }}
            </strong>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
    <v-card-text v-else>{{ t("noAppointments") }}</v-card-text>
  </v-card>
</template>

<style scoped></style>
