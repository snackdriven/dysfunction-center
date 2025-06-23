import { api } from "encore.dev/api";

// API Information and Health Check
export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  status: string;
  timestamp: string;
  services: string[];
  endpoints: {
    tasks: string[];
    habits: string[];
    mood: string[];
    preferences: string[];
  };
}

// Root endpoint - API information and health check
export const getApiInfo = api(
  { method: "GET", path: "/", expose: true },
  async (): Promise<ApiInfoResponse> => {
    return {
      name: "Meh-trics API",
      version: "0.1.0",
      description: "A productivity tracking application with task management, habit tracking, mood logging, and theme preferences",
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: ["tasks", "habits", "mood", "preferences"],
      endpoints: {
        tasks: [
          "GET /tasks - List all tasks with optional filtering",
          "POST /tasks - Create a new task",
          "GET /tasks/:id - Get a specific task",
          "PUT /tasks/:id - Update a task",
          "DELETE /tasks/:id - Delete a task"
        ],
        habits: [
          "GET /habits - List all habits with analytics",
          "POST /habits - Create a new habit",
          "GET /habits/:id - Get a specific habit",
          "PUT /habits/:id - Update a habit",
          "DELETE /habits/:id - Delete a habit",
          "POST /habits/:habit_id/completions - Log habit completion",
          "GET /habits/:habit_id/history - Get habit completion history"
        ],
        mood: [
          "GET /mood - List mood entries",
          "POST /mood - Create a mood entry",
          "GET /mood/:id - Get a specific mood entry",
          "PUT /mood/:id - Update a mood entry",
          "DELETE /mood/:id - Delete a mood entry",
          "GET /mood/analytics - Get mood analytics"
        ],
        preferences: [
          "GET /preferences/:key - Get a user preference",
          "POST /preferences - Set a user preference",
          "DELETE /preferences/:key - Delete a user preference",
          "GET /theme - Get theme preferences",
          "POST /theme - Set theme preferences",
          "GET /theme/system - Get system theme info"
        ]
      }
    };
  }
);

// Health check endpoint
export const healthCheck = api(
  { method: "GET", path: "/health", expose: true },
  async (): Promise<{ status: string; timestamp: string }> => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString()
    };
  }
);
