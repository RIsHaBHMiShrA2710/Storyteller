const passport = require('passport');
const { hashPassword } = require('../utils/passwordUtils');
const User = require("../models/user");
const passportConfig = require('../config/passportConfig'); // Import your Passport configuration

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw { status: 400, message: 'Username and password are required' };
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw { status: 400, message: 'Username already exists' };
        }

        const hashedPassword = await hashPassword(password); // Use the hashPassword function

        const user = new User({ username, password: hashedPassword, history: [] });
        await user.save();

        res.status(200).send('User registered successfully.');
    } catch (error) {
        // Inside the catch block of registerUser
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || 'Internal server error' });

    }
};

// Login user
exports.loginUser = (req, res, next) => {
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
};

// Logout user
exports.logoutUser = async (req, res) => {
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
};
