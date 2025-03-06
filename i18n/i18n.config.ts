import itIT from "./translations/it-IT.json";
import enUS from "./translations/en-US.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    "en-US": enUS,
    "it-IT": itIT,
  },
}));
