import itIT from "@/i18n/translations/it-IT.json";
import enUS from "@/i18n/translations/en-US.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    "en": enUS,
    "it": itIT,
  },
}));
