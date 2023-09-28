// dotenvConfig.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGOAUTH: process.env.MONGOAUTH,
  SESSION_SECRET: process.env.SESSION_SECRET,
};
