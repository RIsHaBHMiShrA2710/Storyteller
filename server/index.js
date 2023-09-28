require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const passport = require('./config/passportConfig');
const mongooseConnection = require('./config/mongooseConfig'); 
const { PORT } = require('./config/dotenvConfig');
const isAuthenticated = require('./middleware/isAuthenticated');
const authController = require('./controllers/authController');
const storyController = require('./controllers/storyController');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from any origin
  credentials: true,
};
app.use(cors(corsOptions));               

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());


// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err);

  // Default to 500 Internal Server Error for unhandled errors
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ message });
});


// Register a new user
app.post('/register', authController.registerUser);

// Login user
app.post('/login', authController.loginUser);

// Logout user
app.get('/logout', authController.logoutUser);

app.post('/api/add-prompt', isAuthenticated, storyController.addPrompt);

// Upvote a story
app.post('/api/upvote-story/:storyId', isAuthenticated, storyController.upvoteStory);

// Downvote a story
app.post('/api/downvote-story/:storyId', isAuthenticated, storyController.downvoteStory);

// Get user history
app.get('/api/user-history', isAuthenticated, storyController.getUserHistory);

// Delete a story by ID
app.delete('/api/delete-story/:storyId', isAuthenticated, storyController.deleteStory);

app.get('/api/all-stories' , storyController.getAllStories);

app.get('/dashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  mongooseConnection.once('open', () => {
  console.log('Connected to MongoDB');
  });
});
