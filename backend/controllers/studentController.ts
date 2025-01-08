import StudentModel from '../models/Students';
import { Request, Response } from 'express';
import { Workbook } from 'exceljs';
import { Parser } from 'json2csv';
import { Types } from "mongoose";
import multer from 'multer';
import path from 'path';
import Joi from 'joi';

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
const upload = multer({ storage: storage }).single('profilePicture');


export const createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = studentSchema.validate({ ...req.body });
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const existingStudent = await StudentModel.findOne({ email: req.body.email });
        if (existingStudent) {
            res.status(400).json({ message: "Email already in use" });
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
        await newStudent.save();
        res.status(201).json(newStudent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating student", error: err });
    }
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


export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = studentSchema.validate({ ...req.body });
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const existingStudent = await StudentModel.findOne({ email: req.body.email });
        if (existingStudent && (existingStudent._id as Types.ObjectId).toString() !== req.params.id) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        const student = await StudentModel.findById(req.params.id);
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }

        const profilePicture = req.file ? `/uploads/${req.file.filename}` : student.profilePicture;
        const updatedStudent = await StudentModel.findByIdAndUpdate(req.params.id, { ...req.body, profilePicture, }, { new: true });
        res.status(200).json(updatedStudent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating student", error: err });
    }
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


export const exportStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ageFilter, searchQuery, format = 'csv' } = req.query;
        let query: any = {};
        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { surname: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                ]
            };
        }
        if (ageFilter) {
            const ageRange = ageFilter as string;
            const [minAge, maxAge] = ageRange.split('-');
            if (maxAge) {
                query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
            }
            else {
                query.age = { $gte: parseInt(minAge) };
            }
        }
        const students = await StudentModel.find(query).lean();
        if (format === 'excel') {
            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Students');
            worksheet.columns = [
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Surname', key: 'surname', width: 20 },
                { header: 'Age', key: 'age', width: 10 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Address', key: 'address', width: 40 },
                { header: 'Roll No', key: 'rollno', width: 10 },
            ];
            worksheet.addRows(students);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        }
        else if (format === 'csv') {
            const parser = new Parser();
            const csv = parser.parse(students);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
            res.send(csv);
        }
        else {
            res.status(400).json({ message: 'Invalid format specified' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error exporting data', error });
    }
};