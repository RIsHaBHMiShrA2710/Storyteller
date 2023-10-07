
const bcrypt = require('bcryptjs');

// Hash a password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

module.exports = {
  hashPassword,
};
