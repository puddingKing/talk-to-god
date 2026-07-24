module.exports = {
  apps: [
    {
      name: "talk-to-god-api",
      cwd: "/var/www/talk-to-god/server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
