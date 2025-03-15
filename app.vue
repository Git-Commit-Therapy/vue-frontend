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
  <v-app>
    <NavBar />
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center">
        <v-col cols="auto"></v-col>
        <v-col>
          <NuxtPage />
        </v-col>
        <v-col cols="auto"></v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style>
</style>
