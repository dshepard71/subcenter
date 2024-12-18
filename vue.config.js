const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/check-user-password': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug', // Helpful for debugging, remove in production
      },
      '^/upload-teachers': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/upload-schedules': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/upload-substitutes': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/upload-daily-schedule': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/upload-pay-end-dates': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/upload-days-of-school': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/users': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/reset-password': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/teachers': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/schedules': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/daily-schedule': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
       '^/payEndDates': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/daysOfSchool': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/teachers/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/schedules/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/users/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
       '^/daily-schedule/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
       '^/payEndDates/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/daysOfSchool/:id': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/teachers': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/schedules': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/daily-schedule': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
       '^/payEndDates': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
      '^/daysOfSchool': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        logLevel: 'debug',
      },
    },
  },
});