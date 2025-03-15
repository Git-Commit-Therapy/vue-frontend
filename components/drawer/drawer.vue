<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isDrawerOpen = ref(false);

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value;
}

function closeDrawer() {
  isDrawerOpen.value = false;
}
</script>

<template>
  <div>
    <v-btn icon @click="toggleDrawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <v-navigation-drawer
      v-model="isDrawerOpen"
      temporary
    >
      <v-list max-width="250">
        <v-list-item
          to="/patient/appointments"
          @click="closeDrawer"
        >
          <template v-slot:prepend>
            <v-icon>mdi-medical-bag</v-icon>
          </template>
          <v-list-item-title>{{ $t('visitList') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/patient/medical-exams"
          @click="closeDrawer"
        >
          <template v-slot:prepend>
            <v-icon>mdi-file-document</v-icon>
          </template>
          <v-list-item-title>{{ $t('reportList') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>
