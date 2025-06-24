import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the database
export const journalDB = new SQLDatabase("journal", {
  migrations: {
    path: "./migrations"
  }
});

// Create the service
export default new Service("journal");
