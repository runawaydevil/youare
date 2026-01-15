// PM2 Ecosystem Configuration
// Copy this file to ecosystem.config.cjs and fill in your values
module.exports = {
  apps: [
    {
      name: 'yourinfo',
      script: 'bun',
      args: 'run server/index.ts',
      cwd: '/path/to/yourinfo',
      env: {
        PORT: 3020,
        REDIS_URL: 'rediss://:YOUR_REDIS_PASSWORD@your-redis-host:6379',
        GROK_API_KEY: 'your-grok-api-key',
      },
    },
    // Add more instances for load balancing:
    // {
    //   name: 'yourinfo-2',
    //   script: 'bun',
    //   args: 'run server/index.ts',
    //   cwd: '/path/to/yourinfo',
    //   env: {
    //     PORT: 3021,
    //     REDIS_URL: 'rediss://:YOUR_REDIS_PASSWORD@your-redis-host:6379',
    //     GROK_API_KEY: 'your-grok-api-key',
    //   },
    // },
  ],
};
