import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.baseUrl =
        process.env.CYPRESS_BASE_URL ||
        (config.env.baseUrl as string) ||
        'http://localhost:5000';
      config.env.adminUsername =
        process.env.CYPRESS_ADMIN_USERNAME ||
        (config.env.adminUsername as string) ||
        'admin';
      config.env.adminPassword =
        process.env.CYPRESS_ADMIN_PASSWORD ||
        (config.env.adminPassword as string) ||
        'test123';
      config.env.userUsername =
        process.env.CYPRESS_USER_USERNAME ||
        (config.env.userUsername as string) ||
        'TestUser';
      config.env.userPassword =
        process.env.CYPRESS_USER_PASSWORD ||
        (config.env.userPassword as string) ||
        'test123';
      return config;
    },
    baseUrl: 'http://localhost:5000',
    defaultCommandTimeout: 8000,
    env: {},
  },
});
