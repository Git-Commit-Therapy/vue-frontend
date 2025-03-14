<script setup>
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const validJWT = authStore.isValidToken();
onBeforeMount( async() => {
  authStore.setAuthUrl(process.env.VITE_APP_AUTH_URL);
})
</script>

<template>
  <NuxtLayout>
    <v-app>
      <NavBar v-if="validJWT" />
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>

<style>
</style>
