module.exports = {
  apps: [
    {
      name: 'lider-auth',
      script: './dist/main.js',
      cron_restart: '0 0 * * *',
      instances: 3,
      max_memory_restart: '4G',
      restart_delay: 3000,
      autorestart: true,
      exec_mode: 'cluster',
    },
  ],
};
