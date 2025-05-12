<script setup lang="ts">
import NavBar from "@/components/navbar/Navbar.vue";
import { useAuthStore } from "@/stores/authStore";
import env from "@/utils/env";
import AuthGRPC from "@/composable/clients/authGrpcClient";
const authStore = useAuthStore();
onBeforeMount(async () => {
  authStore.setAuthUrl(env.AUTH_URL);
  AuthGRPC.getInstance(authStore.getAuthUrl());
  authStore.startTokenRefresh();
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
