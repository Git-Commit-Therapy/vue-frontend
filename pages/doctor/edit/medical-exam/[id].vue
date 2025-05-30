<script setup lang="ts">
import type { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";
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
const medicalExam = ref<MedicalExam>();
const valid = ref(false);
const patients = ref<Patient[]>([]);
const form = ref<MedicalExam>({
  medicalExamId: -1,
  patient: undefined,
  examDate: undefined,
  examType: "",
  notes: "",
});

const rules = {
  required: (v: string) => !!v || "Required",
};

onBeforeMount(async () => {
  raw.value = localStorage.getItem("currentMedicalExam");
  if (!raw.value) return;

  medicalExam.value = JSON.parse(raw.value) as MedicalExam;
  if (medicalExam.value.medicalExamId !== Number(id)) {
    console.warn(
      `ID mismatch: expected ${id}, got ${medicalExam.value.medicalExamId}`,
    );
    router.push(`/doctor/edit/medical-exam/`);
  }

  form.value = medicalExam.value;
  patients.value = (await employeeGRPC.getAllPatients()).patients;
});

async function submitForm() {
  const res = await employeeGRPC.modifyMedicalExam(form.value);
  if (res.success) {
    localStorage.removeItem("currentMedicalExam");
    router.push(`/doctor/edit/medical-exam/`);
  }
}
</script>

<template>
  <v-container>
    <v-card class="pa-4" max-width="600">
      <v-card-title>Edit Medical Exam</v-card-title>
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-autocomplete
          v-model="form.patient"
          :items="patients"
          :label="t('medicalExam.patient')"
          item-title="user.name"
          item-value="id"
          return-object
          clearable
          variant="outlined"
        />
        <v-text-field
          v-model="form.examDate"
          label="Date"
          type="date"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.examType"
          :label="t('medicalExam.examType')"
          :rules="[rules.required]"
          variant="outlined"
        />
        <v-textarea
          v-model="form.notes"
          :label="t('medicalExam.notes')"
          variant="outlined"
        />
        <v-btn type="submit" :disabled="!valid" color="primary">Save</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
