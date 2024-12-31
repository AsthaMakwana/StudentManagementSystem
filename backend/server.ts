import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import studentRoutes from './routes/studentRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect("mongodb://127.0.0.1:27017/mern")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/students', studentRoutes);

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
