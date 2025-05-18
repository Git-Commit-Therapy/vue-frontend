import itIT from "@/i18n/translations/it-IT.json";
import enUS from "@/i18n/translations/en-US.json";
import { it, en } from "vuetify/locale";
export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: { ...enUS, ...en },
    it: { ...itIT, ...it },
  },
}));
