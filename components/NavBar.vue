<script setup>
  import { useLocale, useTheme } from 'vuetify'


  const { current } = useLocale()
  const theme = useTheme()

  function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }
  function changeLocale (locale) {
    current.value = locale
  }
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/dashboard">Hospital San Commito</router-link>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        </ul>
        <router-link to="/profile">
          <button class="btn btn-outline-primary">Profile</button>
        </router-link>
      </div>
    </div>
    <v-btn @click="toggleTheme">toggle theme</v-btn>
    <v-btn @click="changeLocale">change locale</v-btn>

  </nav>
</template>

<style scoped>
</style>
