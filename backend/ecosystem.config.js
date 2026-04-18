module.exports = {
  apps: [
    {
      name: "changenow-backend",
      script: "server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
