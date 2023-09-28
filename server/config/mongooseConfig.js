// mongooseConfig.js
const mongoose = require('mongoose');
const { MONGOAUTH } = require('./dotenvConfig'); // Load environment variables

mongoose.connect(MONGOAUTH, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose.connection;
