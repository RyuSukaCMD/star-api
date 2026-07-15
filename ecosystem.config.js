// ==========================================
// StarNova API - PM2 Ecosystem Configuration
// ==========================================

module.exports = {
  apps: [
    {
      name: 'starnova-api',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_file: 'logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
};
