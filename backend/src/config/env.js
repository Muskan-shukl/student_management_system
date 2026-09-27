require('dotenv').config({ quiet: true });

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'student_management',
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim()),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Public URL of the frontend, used to build password-reset links.
  appUrl: (process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim(),
});
