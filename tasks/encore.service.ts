import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the database
export const taskDB = new SQLDatabase("tasks", {
  migrations: {
    path: "./migrations"
  }
});

// Create the service
export default new Service("tasks");
