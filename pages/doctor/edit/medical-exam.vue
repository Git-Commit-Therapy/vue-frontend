<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Doctor } from "~/composable/protobuf/frontend/user";
import {
  GetMedicalExamsFromDoctorRequest,
  GetMedicalExamsFromDoctorResponse,
} from "~/composable/protobuf/frontend/employee_services";

const router = useRouter();
const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const loading = ref(false);
const exams = ref<MedicalExam[]>([]);
const currentDoctor = ref<Doctor>();
const now = new Date();

const fetchExams = async () => {
  loading.value = true;
  const req: GetMedicalExamsFromDoctorRequest = {
    doctor: currentDoctor.value,
    fromDate: fromDate.value ?? undefined,
    toDate: toDate.value ?? undefined,
  };

  try {
    const res: GetMedicalExamsFromDoctorResponse =
      await employeeGRPC.getMedicalExamsFromDoctor(req);
    exams.value = res.medicalExams;
  } catch (err) {
    console.error("Failed to fetch medical exams", err);
  } finally {
    loading.value = false;
  }
};

const canEdit = (date: string | Date) => new Date(date) > now;

const editExam = (exam: MedicalExam) => {
  localStorage.setItem("currentMedicalExam", JSON.stringify(exam));
  router.push(`/doctor/edit/medical-exam/${exam.medicalExamId}`);
};
</script>

<template>
  <div class="p-4 space-y-4">
    <VCard>
      <VCardTitle>{{ t("searchMedicalExams") }}</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="fetchExams">
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

    <div v-if="exams.length">
      <VCard v-for="exam in exams" :key="exam.medicalExamId" class="my-2">
        <VCardTitle>
          {{ exam.patient?.user?.name }} {{ exam.patient?.user?.surname }} —
          {{ exam.examDate }}
        </VCardTitle>
        <VCardActions>
          <VBtn
            v-if="canEdit(exam.examDate!)"
            color="warning"
            @click="editExam(exam)"
          >
            {{ t("edit") }}
          </VBtn>
          <span v-else>{{ t("pastExam") }}</span>
        </VCardActions>
      </VCard>
    </div>
  </div>
</template>
