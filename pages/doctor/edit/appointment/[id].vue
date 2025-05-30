<script setup lang="ts">
import type { Appointment } from "~/composable/protobuf/frontend/appointment";

import { ref, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Patient } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const { t } = useI18n();
const raw = ref();
const appointment = ref<Appointment>();
const valid = ref(false);
const form = ref<Appointment>({
  appointmentId: -1,
  dateTime: undefined,
  staff: undefined,
  doctor: undefined,
  patient: undefined,
});
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const patients = ref<Patient[]>([]);
const rules = {
  required: (v: string) => !!v || "Required",
};

onBeforeMount(async () => {
  raw.value = localStorage.getItem("currentAppointment");
  if (!raw.value) return;

  appointment.value = JSON.parse(raw.value) as Appointment;
  if (appointment.value.appointmentId !== Number(id)) {
    console.warn(
      `Appointment id mismatch: expected ${id}, got ${appointment.value.appointmentId}`,
    );
    router.push(`/doctor/edit/appointment/`);
  }

  form.value = appointment.value;
  patients.value = (await employeeGRPC.getAllPatients()).patients;
});

async function submitForm() {
  const res = await employeeGRPC.modifyAppointment(form.value);
  if (res.success) {
    localStorage.removeItem("currentAppointment");
    router.push(`/doctor/edit/appointment/`);
  }
}
</script>
<template>
  <v-container>
    <v-card class="pa-4" max-width="600">
      <v-card-title>Edit Appointment</v-card-title>
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-autocomplete
          v-model="form.patient"
          :items="patients"
          :label="t('appointment.patient')"
          item-title="user.name"
          item-value="id"
          return-object
          clearable
          variant="outlined"
        />
        <v-text-field
          v-model="form.dateTime"
          label="Date"
          type="date"
          :rules="[rules.required]"
        />
        <v-btn type="submit" :disabled="!valid" color="primary">Save</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
