module.exports = {
  apps: [
    {
      name: 'harsh-electronics-api',
      script: 'src/app.js',
      cwd: '/var/www/harsh-electronics/server',
      instances: 'max', // or 1 for t2.micro/t3.micro free tier
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/harsh-electronics/err.log',
      out_file: '/var/log/harsh-electronics/out.log',
      merge_logs: true,
      time: true
    }
  ]
};
