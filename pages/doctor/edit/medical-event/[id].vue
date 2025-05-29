<script setup lang="ts">
import type { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import type { Patient } from "~/composable/protobuf/frontend/user";

import { ref, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const id = route.params.id as string;
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const raw = ref();
const medicalEvent = ref<MedicalEvent>();
const valid = ref(false);
const patients = ref<Patient[]>([]);
const form = ref<MedicalEvent>({
  medicalEventId: -1,
  patient: undefined,
  eventDate: undefined,
  description: "",
});

const rules = {
  required: (v: string) => !!v || "Required",
};

onBeforeMount(async () => {
  raw.value = localStorage.getItem("currentMedicalEvent");
  if (!raw.value) return;

  medicalEvent.value = JSON.parse(raw.value) as MedicalEvent;
  if (medicalEvent.value.medicalEventId !== Number(id)) {
    console.warn(
      `ID mismatch: expected ${id}, got ${medicalEvent.value.medicalEventId}`,
    );
    router.push(`/doctor/edit/medical-event/`);
  }

  form.value = medicalEvent.value;
  patients.value = (await employeeGRPC.getAllPatients()).patients;
});

async function submitForm() {
  const res = await employeeGRPC.modifyMedicalEvent(form.value);
  if (res.success) {
    localStorage.removeItem("currentMedicalEvent");
    router.push(`/doctor/edit/medical-event/`);
  }
}
</script>

<template>
  <v-container>
    <v-card class="pa-4" max-width="600">
      <v-card-title>Edit Medical Event</v-card-title>
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-autocomplete
          v-model="form.patient"
          :items="patients"
          :label="t('medicalEvent.patient')"
          item-title="user.name"
          item-value="id"
          return-object
          clearable
          variant="outlined"
        />
        <v-text-field
          v-model="form.eventDate"
          label="Date"
          type="date"
          :rules="[rules.required]"
        />
        <v-textarea
          v-model="form.description"
          :label="t('medicalEvent.description')"
          :rules="[rules.required]"
          variant="outlined"
        />
        <v-btn type="submit" :disabled="!valid" color="primary">Save</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
