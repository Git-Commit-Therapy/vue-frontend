<script setup>
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();
const router = useRouter();

const goToPage = (page) => {
  router.push({ name: page });
};
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, {{ dataStore.nameSurname }}</p>
    <button @click="goToPage('patient/medical-exams')">Reports List</button>
    <button @click="goToPage('patient/medical-events')">Medical Events List</button>
    <button @click="goToPage('patient/appointments')">Appointments List</button>
  </div>
</template>

<style scoped></style>
