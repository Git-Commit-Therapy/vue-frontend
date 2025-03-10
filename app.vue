<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import NavBar from '@/components/NavBar.vue'

const authStore = useAuthStore()
const isAuthenticated = authStore.isAuthenticated()

const dataStore = useDataStore()

onBeforeMount( async() => {
  await dataStore.init()

  if(isAuthenticated){
    await dataStore.initPatientData()
  }
})
</script>

<template>
  <NuxtLayout>
    <v-app>
      <!-- <NavBar v-if="isAuthenticated" /> -->
      <NavBar />
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>

<style>
</style>
