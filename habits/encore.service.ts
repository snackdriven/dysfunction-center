import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the database (reuse tasks database with migrations)
export const habitDB = new SQLDatabase("habits", {
  migrations: {
    path: "./migrations"
  }
});

// Create the service
export default new Service("habits");
