<script setup>
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();

const dateFrom = ref(null);
const dateTo = ref(null);
const medicalExams = ref([]);
const selectedExam = ref(null);
const examDetails = ref(null);

const dateFromISO = computed({
  get: () => dateFrom.value ? dateFrom.value.toISOString().split('T')[0] : null,
  set: (value) => dateFrom.value = value ? new Date(value) : null
});

const dateToISO = computed({
  get: () => dateTo.value ? dateTo.value.toISOString().split('T')[0] : null,
  set: (value) => dateTo.value = value ? new Date(value) : null
});

const loadMedicalExams = async () => {
  try {
    if (dateFrom.value && dateTo.value) {
      medicalExams.value = await dataStore.fetchAllMedicalExam(dateFrom.value, dateTo.value);
    }
  } catch (error) {
    console.error('Error fetching medical exams:', error);
  }
};

const loadExamDetails = async () => {
  try {
    if (selectedExam.value) {
      examDetails.value = await dataStore.fetchMedicalExamDetails(selectedExam.value);
    }
  } catch (error) {
    console.error('Error fetching exam details:', error);
  }
};

watch(selectedExam, loadExamDetails);

onBeforeMount(async () => {
  dateTo.value = new Date(); // Today
  dateFrom.value = new Date();
  dateFrom.value.setMonth(dateFrom.value.getMonth() - 3); // 3 months ago
  await loadMedicalExams();
});
</script>

<template>
  <div v-if="!selectedExam">
    <h1>Medical Exams List</h1>
    <div>
      <label for="dateFrom">From:</label>
      <input type="date" id="dateFrom" v-model="dateFromISO" @change="loadMedicalExams" />
      <label for="dateTo">To:</label>
      <input type="date" id="dateTo" v-model="dateToISO" @change="loadMedicalExams" />
    </div>
    <ul>
      <li v-for="exam in medicalExams" :key="exam.id">
        {{ exam.description }}
        <button @click="selectedExam = exam">Inspect Exam</button>
      </li>
    </ul>
  </div>
  <div v-else>
    <h2>Exam Details</h2>
    <p v-if="examDetails">{{ examDetails }}</p>
    <button @click="selectedExam = null">Back to List</button>
  </div>
</template>

<style scoped>
/* Add custom styles here */
</style>
