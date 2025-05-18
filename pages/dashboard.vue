<script setup lang="ts">
import { useDataStore } from "@/stores/dataStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const dataStore = useDataStore();
const authStore = useAuthStore();
const router = useRouter();

const goToPage = (page) => {
  router.push({ name: page });
};
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, {{ dataStore.nameSurname }}</p>

    <div v-if="authStore.isDoctor()">
      <h2>Doctor's Section</h2>
    </div>

    <div v-if="authStore.isStaff()">
      <h2>Staff's Section</h2>

      <!--TODO: add role check (admin)-->
      <router-link :to="{ path: '/staff/administration' }"
        >Go to Administration Page</router-link
      >
    </div>
  </div>
</template>

<style scoped></style>
