const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();

exports.signup = async (req, res) => {

    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userRole = role === 'admin' ? 'admin' : 'user';
        const newUser = new User({ username, email, password: hashedPassword, role: userRole });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    }
    catch (error) {
        console.log('Error during registration:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

exports.login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
            token,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
    }
    catch (error) {
        console.log('Error during login:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
