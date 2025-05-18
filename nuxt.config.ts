import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error: "Object is possibly undefined". This never happens, it's just typescript crying.
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@nuxtjs/i18n",
    "@pinia/nuxt",
  ],
  i18n: {
    vueI18n: "~/i18n/i18n.config.ts",
  },
  build: {
    transpile: ["vuetify"],
  },
  runtimeConfig: {
    public: {
      AUTH_URL: process.env.AUTH_URL,
      PATIENTS_URL: process.env.PATIENTS_URL,
      EMPLOYEES_URL: process.env.EMPLOYEES_URL,
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      allowedHosts: [".sancommitto.local"],
      cors: true,
    },
  },
});
