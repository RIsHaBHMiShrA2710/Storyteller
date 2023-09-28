const User = require('../models/user');
const Story = require('../models/story');
// Add a new story prompt
exports.addPrompt = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id; // Assuming you have user information in req.user

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            // Handle the case where the user doesn't exist
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new Prompt object
        const newPrompt = {
            title,
            content,
            upvotes: [],
            downvotes: [],
        };

        // Create a new Story document
        const newStory = new Story({
            author: userId, // Set the author's user ID
            title,
            content,
            upvotes: [],
            downvotes: [],
        });

        // Add the prompt to the user's history
        user.history.push(newPrompt);

        // Save the user document in the database
        await user.save();

        // Save the new story document in the database
        await newStory.save();

        // Respond with a success status
        res.status(200).send('Prompt added successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
};

// Upvote a story
exports.upvoteStory = async (req, res) => {
    const userId = req.user.id; // User who is upvoting
    const storyId = req.params.storyId;
  
    try {
      // Find the story
      const story = await Story.findById(storyId);
  
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
  
      // Check if the user has already upvoted this story
      const hasUpvoted = story.upvotes.some((upvote) => upvote.userId.toString() === userId);
  
      if (hasUpvoted) {
        return res.status(400).json({ message: 'User has already upvoted this story' });
      }
  
      // Add the user's ID to the story's upvotes array
      story.upvotes.push({ userId });
  
      // Update the story in the database
      await story.save();
  
      // Find the author of the story
      const author = await User.findById(story.author);
    
      const storyIndex = author.history.findIndex((authorStory) => authorStory.title === story.title);
      // Update the author's history to reflect the upvote
      author.history[storyIndex].upvotes.push({ userId });
      
      // Save changes to the author's history
      await author.save();
  
      res.status(200).json({ message: 'Story upvoted successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Downvote a story
exports.downvoteStory = async (req, res) => {
    const userId = req.user.id; // User who is downvoting
    const storyId = req.params.storyId;

    try {
        // Find the story
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if the user has already downvoted this story
        const hasDownvoted = story.downvotes.some((downvote) => downvote.userId.toString() === userId);

        if (hasDownvoted) {
            return res.status(400).json({ message: 'User has already downvoted this story' });
        }

        // Add the user's ID to the story's downvotes array
        story.downvotes.push({ userId });

        // Update the story in the database
        await story.save();

        // Find the author of the story
        const author = await User.findById(story.author);

        const storyIndex = author.history.findIndex((authorStory) => authorStory.title === story.title);

        // Update the author's history to reflect the downvote
        author.history[storyIndex].downvotes.push({ userId });

        // Save changes to the author's history
        await author.save();

        res.status(200).json({ message: 'Story downvoted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get user history
exports.getUserHistory = async (req, res) => {
    const userId = req.user.id; // Assuming you have user information in req.user

    try {
        // Find all stories where the author ID matches the user ID
        const userHistory = await Story.find({ author: userId });

        res.status(200).json(userHistory);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
};


exports.getAllStories = async (req, res) => {
    try {
      // Fetch all stories from the database
      const stories = await Story.find({}, '_id title content upvotes downvotes');
  
      res.status(200).json(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
// Delete a story by ID
exports.deleteStory = async (req, res) => {
    const userId = req.user.id;
    const storyId = req.params.storyId;

    try {
        // Remove the story from the user's history by updating the user document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { history: { _id: storyId } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the story from the story database
        const deletedStory = await Story.findByIdAndRemove(storyId);

        if (!deletedStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
};

