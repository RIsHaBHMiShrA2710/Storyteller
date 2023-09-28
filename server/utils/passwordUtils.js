const bcrypt = require('bcrypt');

// Hash a password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

module.exports = {
  hashPassword,
};
