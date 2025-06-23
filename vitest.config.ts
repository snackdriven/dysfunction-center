import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./frontend/src/setupTests.ts'],
    globals: true,
    include: [
      './frontend/src/**/*.test.{ts,tsx}',
      './habits/**/*.test.ts',
      './mood/**/*.test.ts',
      './preferences/**/*.test.ts',
      './tasks/**/*.test.ts'
    ]
  }
});
