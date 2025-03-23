<script setup lang="ts">
import NavBar from "@/components/navbar/navbar.vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const validJWT = authStore.isValidToken();
onBeforeMount(async () => {
  authStore.setAuthUrl(AUTH_URL as string);
});
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

<style></style>
