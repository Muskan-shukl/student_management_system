const env = require('./config/env');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  if (server) server.close();
  await disconnectDB();
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  shutdown('unhandledRejection');
});

start();
