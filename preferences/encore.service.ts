import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the database (reuse same database with migrations)
export const preferencesDB = new SQLDatabase("preferences", {
  migrations: {
    path: "./migrations"
  }
});

// Create the service
export default new Service("preferences");
