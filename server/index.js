require('dotenv').config();
const express = require('express');
const mongooseConnection = require('./config/mongooseConfig');
const { PORT } = require('./config/dotenvConfig');
const isAuthenticated = require('./middleware/isAuthenticated');
const jwt = require('jsonwebtoken'); // Import the JWT library
const jwtConfig = require('./config/jwtConfig'); // Import your JWT configuration
const authController = require('./controllers/authController');
const storyController = require('./controllers/storyController');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Register a new user and return a JWT token
app.post('/register', authController.registerUser);

// Login user and return a JWT token
app.post('/login', authController.loginUser);

// Routes below this middleware require authentication via JWT token
app.get('/api/all-stories', storyController.getAllStories);
app.get('/api/full-story/:storyId', storyController.fullStory);
app.use(isAuthenticated);

// Logout user (optional)


app.post('/api/add-prompt', storyController.addPrompt);
app.post('/api/upvote-story/:storyId', storyController.upvoteStory);
app.post('/api/downvote-story/:storyId', storyController.downvoteStory);
app.get('/api/user-history', storyController.getUserHistory);
app.delete('/api/delete-story/:storyId', storyController.deleteStory);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  mongooseConnection.once('open', () => {
    console.log('Connected to MongoDB');
  });
});
