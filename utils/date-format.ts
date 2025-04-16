import { useI18n } from "vue-i18n";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";

/**
 * Formats a date to the correct locale.
 * @param {Date} date Date to format.
 * @returns {string} formatted date according to the current locale.
 */
export function formatDateTime(date: Date): string {
  const currentLocale = useI18n().locale.value === "it" ? it : enUS;
  return format(date, "PPPpp", { locale: currentLocale });
}
