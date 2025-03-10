import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import getPreferredTheme from "@/utils/preferred-theme";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: getPreferredTheme(),
    },
  });
  app.vueApp.use(vuetify);
});
