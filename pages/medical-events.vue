<script setup>
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();

const dateFrom = ref(null);
const dateTo = ref(null);
const medicalEvents = ref([]);

const dateFromISO = computed({
  get: () => dateFrom.value ? dateFrom.value.toISOString().split('T')[0] : null,
  set: (value) => dateFrom.value = value ? new Date(value) : null
});

const dateToISO = computed({
  get: () => dateTo.value ? dateTo.value.toISOString().split('T')[0] : null,
  set: (value) => dateTo.value = value ? new Date(value) : null
});

const loadMedicalEvents = async () => {
  try {
    if (dateFrom.value && dateTo.value) {
      medicalEvents.value = await dataStore.fetchAllMedicalEvent(dateFrom.value, dateTo.value);
    }
  } catch (error) {
    console.error('Error fetching medical events:', error);
  }
};

onBeforeMount(async () => {
  dateTo.value = new Date(); // Today
  dateFrom.value = new Date();
  dateFrom.value.setMonth(dateFrom.value.getMonth() - 3); // 3 months ago
  await loadMedicalEvents();
});
</script>

<template>
  <div>
    <h1>Medical Events List</h1>
    <div>
      <label for="dateFrom">From:</label>
      <input type="date" id="dateFrom" v-model="dateFromISO" @change="loadMedicalEvents" />
      <label for="dateTo">To:</label>
      <input type="date" id="dateTo" v-model="dateToISO" @change="loadMedicalEvents" />
    </div>
    <ul>
      <li v-for="event in medicalEvents" :key="event.id">{{ event.description }}</li>
    </ul>
  </div>
</template>

<style scoped>
/* Add custom styles here */
</style>
