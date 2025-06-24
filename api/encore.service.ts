import { Service } from "encore.dev/service";
import { api } from "encore.dev/api";
import { Task } from "../tasks/types";
import { Habit } from "../habits/types";
import { JournalEntry } from "../journal/types";
import { MoodEntry } from "../mood/types";
import { exportAsMarkdown, exportAsJson } from "./exportUtils";

export default new Service("api");

// Mock DB fetchers (replace with real DB logic)
async function getAllTasksFromDb(): Promise<Task[]> {
  return [];
}
async function getAllHabitsFromDb(): Promise<Habit[]> {
  return [];
}
async function getAllJournalsFromDb(): Promise<JournalEntry[]> {
  return [];
}
async function getAllMoodsFromDb(): Promise<MoodEntry[]> {
  return [];
}

export const exportTasksJson = api(
  { method: "GET", path: "/exportTasksJson", expose: true },
  async () => {
    const tasks = await getAllTasksFromDb();
    return {
      body: exportAsJson(tasks),
      headers: {
        "Content-Disposition": "attachment; filename=tasks.json",
        "Content-Type": "application/json",
      },
    };
  }
);

export const exportTasksMarkdown = api(
  { method: "GET", path: "/exportTasksMarkdown", expose: true },
  async () => {
    const tasks = await getAllTasksFromDb();
    return {
      body: exportAsMarkdown(tasks, "Task"),
      headers: {
        "Content-Disposition": "attachment; filename=tasks.md",
        "Content-Type": "text/markdown",
      },
    };
  }
);

export const exportHabitsJson = api(
  { method: "GET", path: "/exportHabitsJson", expose: true },
  async () => {
    const habits = await getAllHabitsFromDb();
    return {
      body: exportAsJson(habits),
      headers: {
        "Content-Disposition": "attachment; filename=habits.json",
        "Content-Type": "application/json",
      },
    };
  }
);

export const exportHabitsMarkdown = api(
  { method: "GET", path: "/exportHabitsMarkdown", expose: true },
  async () => {
    const habits = await getAllHabitsFromDb();
    return {
      body: exportAsMarkdown(habits, "Habit"),
      headers: {
        "Content-Disposition": "attachment; filename=habits.md",
        "Content-Type": "text/markdown",
      },
    };
  }
);

export const exportJournalsJson = api(
  { method: "GET", path: "/exportJournalsJson", expose: true },
  async () => {
    const journals = await getAllJournalsFromDb();
    return {
      body: exportAsJson(journals),
      headers: {
        "Content-Disposition": "attachment; filename=journals.json",
        "Content-Type": "application/json",
      },
    };
  }
);

export const exportJournalsMarkdown = api(
  { method: "GET", path: "/exportJournalsMarkdown", expose: true },
  async () => {
    const journals = await getAllJournalsFromDb();
    return {
      body: exportAsMarkdown(journals, "Journal"),
      headers: {
        "Content-Disposition": "attachment; filename=journals.md",
        "Content-Type": "text/markdown",
      },
    };
  }
);

export const exportMoodsJson = api(
  { method: "GET", path: "/exportMoodsJson", expose: true },
  async () => {
    const moods = await getAllMoodsFromDb();
    return {
      body: exportAsJson(moods),
      headers: {
        "Content-Disposition": "attachment; filename=moods.json",
        "Content-Type": "application/json",
      },
    };
  }
);

export const exportMoodsMarkdown = api(
  { method: "GET", path: "/exportMoodsMarkdown", expose: true },
  async () => {
    const moods = await getAllMoodsFromDb();
    return {
      body: exportAsMarkdown(moods, "Mood"),
      headers: {
        "Content-Disposition": "attachment; filename=moods.md",
        "Content-Type": "text/markdown",
      },
    };
  }
);
