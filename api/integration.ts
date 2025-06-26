import { api } from "encore.dev/api";

// GET /integration/productivity/:date
export const getDailyProductivityData = api(
  { method: "GET", path: "/integration/productivity/:date", expose: true },
  async (req: { date: string }) => {
    // TODO: Implement logic to fetch productivity data for the given date
    return { message: `No productivity data for ${req.date}` };
  }
);

// GET /integration/insights?days=7
export const getInsights = api(
  { method: "GET", path: "/integration/insights", expose: true },
  async (req: { days?: number }) => {
    // TODO: Implement logic to fetch insights for the given number of days
    return { message: `No insights for days=${req.days || 7}` };
  }
);
