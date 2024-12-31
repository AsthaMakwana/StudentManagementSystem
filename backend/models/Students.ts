import mongoose, { Document, Schema } from 'mongoose';

interface IStudent extends Document {
    name: string;
    surname: string;
    birthdate: Date;
    rollno: number;
    address: string;
    email: string;
    age: number;
    profilePicture?: string;
}

const StudentSchema: Schema = new Schema({
    name: String,
    surname: String,
    birthdate: Date,
    rollno: Number,
    address: String,
    email: String,
    age: Number,
    profilePicture: String,
});

export default mongoose.model<IStudent>('students', StudentSchema);
