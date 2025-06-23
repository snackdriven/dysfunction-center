import { api, apiEndpoints } from '../../services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

describe('API Configuration', () => {
  it('has correct base URL', () => {
    expect(api.defaults?.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:4000').toBeTruthy();
  });

  it('has correct API endpoints', () => {
    expect(apiEndpoints.tasks.list).toBe('/tasks');
    expect(apiEndpoints.tasks.get('123')).toBe('/tasks/123');
    expect(apiEndpoints.habits.list).toBe('/habits');
    expect(apiEndpoints.mood.list).toBe('/mood');
    expect(apiEndpoints.calendar.events).toBe('/calendar/events');
  });

  it('has calendar month endpoint with parameters', () => {
    expect(apiEndpoints.calendar.month(2024, 0)).toBe('/calendar/events/month/2024/0');
  });
});