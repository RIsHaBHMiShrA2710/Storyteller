require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

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

// Connect to MongoDB using the MONGOAUTH environment variable
mongoose.connect(process.env.MONGOAUTH, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Define a user schema and model
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
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
      downvotes:[
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        },
      ],
    },
  ],
}));


// Configure passport for user authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Invalid username' });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: 'Authentication required' });
}

// Configure express-session for session management
// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err);

  // Default to 500 Internal Server Error for unhandled errors
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ message });
});

// Define routes for registration, login, and viewing user history
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw { status: 400, message: 'Username and password are required' };
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw { status: 400, message: 'Username already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, history: [] });

    await user.save();

    res.status(200).send('User registered successfully.');
  } catch (error) {
    console.error(error);
  }
});

app.post('/login',async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    if (!user) {
      return next({ status: 401, message: 'Authentication failed' });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res.json({ message: 'Login successful', user: req.user });
    });
  })(req, res, next);
});

app.post('/api/add-prompt', isAuthenticated, async (req, res) => {
  const { title, content} = req.body;
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
});
app.post('/api/upvote-story/:storyId', isAuthenticated, async (req, res) => {
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
});

app.post('/api/downvote-story/:storyId', isAuthenticated, async (req, res) => {
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
});

app.get('/api/user-history', isAuthenticated, async (req, res) => {
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
});


app.get('/dashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/logout',cors(corsOptions), async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // Set the CORS headers for the origin of your frontend app and allow credentials
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

// Delete a story by ID
app.delete('/api/delete-story/:storyId', isAuthenticated, async (req, res) => {
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
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
