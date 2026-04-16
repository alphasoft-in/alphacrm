import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Lima";
const LOCALE = "es-PE";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, "dd 'de' MMMM, yyyy", { locale: require("date-fns/locale/es").es });
}

export function formatShortDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, "dd/MM/yyyy");
}
