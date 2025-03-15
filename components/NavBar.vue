<script setup>
import { useI18n } from 'vue-i18n';
import { useLocale, useTheme } from 'vuetify';
import Drawer from '~/components/drawer/drawer.vue';

const { setLocale } = useI18n();
const { current } = useLocale();
const theme = useTheme();

function checkUserLogin() {
  return true;
}

const isUserLoggedIn = checkUserLogin();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}

function changeLocale(locale) {
  current.value = locale;
}
</script>

<template>
  <v-app-bar>
    <Drawer />
    <v-app-bar-title class="text-truncate">
      {{ $t('hospitalName') }}
    </v-app-bar-title>
    <v-spacer />
    <div class="d-flex align-center gap-2">
      <v-btn v-if="isUserLoggedIn" variant="outlined" :to="'/profile'">
        <v-icon start>mdi-account-box</v-icon>
        {{ $t('profile') }}
      </v-btn>
      <v-btn v-else color="primary" variant="outlined" :to="'/login'">
        {{ $t('login') }}
      </v-btn>
      <v-btn icon @click="toggleTheme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="setLocale('en')">
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
          <v-list-item @click="setLocale('it')">
            <v-list-item-title>Italiano</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>
