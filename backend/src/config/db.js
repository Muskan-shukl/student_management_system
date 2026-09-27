const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected: ${mongoose.connection.host}/${env.dbName}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.mongodbUri, { dbName: env.dbName });
};

const disconnectDB = () => mongoose.disconnect();

module.exports = { connectDB, disconnectDB };
