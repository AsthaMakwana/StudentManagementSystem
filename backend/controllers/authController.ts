import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import dotenv from 'dotenv';

dotenv.config();

export const signup = async (req: Request, res: Response): Promise<void> => {

    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Please provide all required fields' });
        return;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
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

export const login = async (req: Request, res: Response): Promise<void> => {

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Please provide both email and password' });
        return;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, } });
    }
    catch (error) {
        console.log('Error during login:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
