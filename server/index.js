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

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

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
      upvotes: Number,
      downvotes: Number,
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

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

function isAuthenticated(req, res, next) {
  console.log('isAuthenticated middleware called');
  console.log(req.user);
  console.log('req.isAuthenticated():', req.isAuthenticated());

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

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      // Handle error (e.g., database error)
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
  })(req, res, next); // This middleware is used to authenticate the user
});

app.post('/api/add-prompt', isAuthenticated, async (req, res) => {
  const { title, story } = req.body;
  const userId = req.user.id; // Assuming you have user information in req.user

  // Create a new prompt object
  const newPrompt = {
    title,
    story,
    upvotes: 0,
    downvotes: 0,
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
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/logout', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    res.redirect('http://localhost:3000');
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
