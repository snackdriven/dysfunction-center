import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export const calendarDB = new SQLDatabase("calendar", {
  migrations: "./migrations",
});

export default new Service("calendar");