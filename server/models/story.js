const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
  });
 const Story = mongoose.model('Story', storySchema);
  module.exports = Story;

  