<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.clearToken()
  router.push('/login')
}
</script>

<template>
  <div>
    <h1>Profile</h1>
    {{ authStore.patientData.patient }}

    {{ authStore.patientData.medicalInfo }}
    <button @click="logout">Logout</button>
  </div>
</template>

<style scoped>
</style>
