import { Request, Response } from 'express';
import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import StudentModel from '../models/Students';


const studentSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    surname: Joi.string().min(3).max(30).required(),
    birthdate: Joi.date().required(),
    rollno: Joi.number().integer().min(1).required(),
    address: Joi.string().min(5).required(),
    email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
    age: Joi.number().integer().min(1).required(),
    profilePicture: Joi.string().uri().optional(),
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


export const createStudent = (req: Request, res: Response): void => {

    const { error } = studentSchema.validate({
        name: req.body.name,
        surname: req.body.surname,
        birthdate: req.body.birthdate,
        rollno: req.body.rollno,
        address: req.body.address,
        email: req.body.email,
        age: req.body.age,
        profilePicture: req.body.profilePicture
    });
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const newStudent = new StudentModel({
        name: req.body.name,
        surname: req.body.surname,
        birthdate: req.body.birthdate,
        rollno: req.body.rollno,
        address: req.body.address,
        email: req.body.email,
        age: req.body.age,
        profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
    });
    newStudent.save()
        .then(student => res.json(student))
        .catch(err => res.status(500).json({ message: 'Error creating student', error: err }));
};


export const getStudents = async (req: Request, res: Response): Promise<void> => {

    try {
        const { page = 1, limit = 5, searchQuery, ageFilter } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        let query: any = {};

        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { surname: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } }
                ]
            };
        }

        if (ageFilter) {
            const ageRange = ageFilter as string;
            const [minAge, maxAge] = ageRange.split('-');
            if (maxAge) {
                query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
            } else {
                query.age = { $gte: parseInt(minAge) };
            }
        }

        const students = await StudentModel.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalStudents = await StudentModel.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limitNumber);

        res.json({ students, totalPages });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching students" });
    }
};


export const getStudentById = (req: Request, res: Response): void => {

    const id = req.params.id;
    StudentModel.findById({ _id: id })
        .then(student => res.json(student))
        .catch(err => res.status(500).json({ message: 'Error fetching student', error: err }));
};


export const updateStudent = (req: Request, res: Response): void => {

    const { error } = studentSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const id = req.params.id;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;

    StudentModel.findByIdAndUpdate({ _id: id }, {
        name: req.body.name,
        surname: req.body.surname,
        birthdate: req.body.birthdate,
        rollno: req.body.rollno,
        address: req.body.address,
        email: req.body.email,
        age: req.body.age,
        profilePicture: profilePicture
    })
        .then(student => res.json(student))
        .catch(err => res.status(500).json({ message: 'Error updating student', error: err }));
};

export const deleteStudent = (req: Request, res: Response): void => {
    const id = req.params.id;
    StudentModel.findByIdAndDelete({ _id: id })
        .then(result => res.json({ success: true, result }))
        .catch(err => res.status(500).json({ message: 'Error deleting student', error: err }));
};


export const checkEmail = async (req: Request, res: Response): Promise<void> => {

    const { email, studentId } = req.body;

    try {
        let student;
        if (studentId) {
            student = await StudentModel.findOne({ email, _id: { $ne: studentId } });
        } 
        else {
            student = await StudentModel.findOne({ email });
        }
        
        if (student) {
            res.status(400).json({ exists: true });
            console.log("huu", student);
        }
        res.status(200).json({ exists: false });
        return
    } 
    catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        return;
    }
};