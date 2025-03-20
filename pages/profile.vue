<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import AuthGRPC from "~/composable/clients/authGrpcClient";

const authStore = useAuthStore();
const router = useRouter();
</script>

<template>
  <div>
    <h1>Profile</h1>
    <!--{{ authStore.patientData.patient }}

    {{ authStore.patientData.medicalInfo }}-->
  </div>
</template>

<style scoped></style>
