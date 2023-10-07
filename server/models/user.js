const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  jwtToken: String, // Add a field to store the JWT token
  history: [
    {
      title: String,
      content: String,
      upvotes: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        },
      ],
      downvotes: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        },
      ],
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
