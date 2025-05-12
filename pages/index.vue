<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <h1 style="font-size: 3em">{{ t("hospitalName") }}</h1>
    <router-link to="/login">
      <button>{{ t("login") }}</button>
    </router-link>
  </div>
</template>

<style lang="scss"></style>

