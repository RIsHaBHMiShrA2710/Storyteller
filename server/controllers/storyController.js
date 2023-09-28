const User = require('../models/user');

// Add a new story prompt
exports.addPrompt = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id; // Assuming you have user information in req.user

    // Create a new prompt object
    const newPrompt = {
        title,
        content,
        upvotes: [],
        downvotes: [],
    };

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            // Handle the case where the user doesn't exist
            return res.status(404).json({ message: 'User not found' });
        }

        // Add the prompt to the user's history
        user.history.push(newPrompt);

        // Save the user document in the database
        await user.save();

        // Respond with a success status
        res.status(200).send('Prompt added successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
};

// Upvote a story
exports.upvoteStory = async (req, res) => {
    const userId = req.user.id; // Assuming you have user information in req.user
    const storyId = req.params.storyId;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the story exists in the user's history
    const storyIndex = user.history.findIndex((story) => story._id.toString() === storyId); // Convert to string for comparison
    if (storyIndex === -1) {
        return res.status(404).json({ message: 'Story not found in user history' });
    }

    // Check if the user has already upvoted this story
    const hasUpvoted = user.history[storyIndex].upvotes.some((upvote) => upvote.userId.toString() === userId); // Convert to string for comparison
    if (hasUpvoted) {
        return res.status(400).json({ message: 'User has already upvoted this story' });
    }

    // Add the user's ID to the story's upvotes array
    user.history[storyIndex].upvotes.push({ userId });

    // Save changes to the database
    await user.save();

    res.status(200).json({ message: 'Story upvoted successfully' });
};

// Downvote a story
exports.downvoteStory = async (req, res) => {
    const userId = req.user.id; // Assuming you have user information in req.user
    const storyId = req.params.storyId;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the story exists in the user's history
    const storyIndex = user.history.findIndex((story) => story._id.toString() === storyId); // Convert to string for comparison
    if (storyIndex === -1) {
        return res.status(404).json({ message: 'Story not found in user history' });
    }

    // Check if the user has already upvoted this story
    const hasDownvoted = user.history[storyIndex].downvotes.some((downvote) => downvote.userId.toString() === userId); // Convert to string for comparison
    if (hasDownvoted) {
        return res.status(400).json({ message: 'User has already upvoted this story' });
    }

    // Add the user's ID to the story's upvotes array
    user.history[storyIndex].downvotes.push({ userId });

    // Save changes to the database
    await user.save();

    res.status(200).json({ message: 'Story upvoted successfully' });
};

// Get user history
exports.getUserHistory = async (req, res) => {
    const userId = req.user.id; // Assuming you have user information in req.user

    // Fetch the user's history from the database based on userId
    try {
        const user = await User.findById(userId);

        if (!user) {
            // Handle the case where the user doesn't exist
            return res.status(404).json({ message: 'User not found' });
        }

        const userHistory = user.history;

        // Respond with the user's history
        res.status(200).json(userHistory);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
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

        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
};
