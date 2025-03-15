<script setup>
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();

const dateFrom = ref(null);
const dateTo = ref(null);
const appointments = ref([]);

const dateFromISO = computed({
  get: () => dateFrom.value ? dateFrom.value.toISOString().split('T')[0] : null,
  set: (value) => dateFrom.value = value ? new Date(value) : null
});

const dateToISO = computed({
  get: () => dateTo.value ? dateTo.value.toISOString().split('T')[0] : null,
  set: (value) => dateTo.value = value ? new Date(value) : null
});

const loadAppointments = async () => {
  try {
    if (dateFrom.value && dateTo.value) {
      appointments.value = await dataStore.fetchAppointments(dateFrom.value, dateTo.value);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
  }
};

onBeforeMount(async () => {
  dateTo.value = new Date(); // Today
  dateFrom.value = new Date();
  dateFrom.value.setMonth(dateFrom.value.getMonth() - 3); // 3 months ago
  await loadAppointments();
});
</script>

<template>
  <div>
    <h1>Appointments List</h1>
    <div>
      <label for="dateFrom">From:</label>
      <input type="date" id="dateFrom" v-model="dateFromISO" @change="loadAppointments" />
      <label for="dateTo">To:</label>
      <input type="date" id="dateTo" v-model="dateToISO" @change="loadAppointments" />
    </div>
    <ul>
      <li v-for="appointment in appointments" :key="appointment.id">{{ appointment.description }}</li>
    </ul>
  </div>
</template>

<style scoped>
/* Add custom styles here */
</style>
