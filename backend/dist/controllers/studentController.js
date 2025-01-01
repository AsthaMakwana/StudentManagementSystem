"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmail = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const joi_1 = __importDefault(require("joi"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const Students_1 = __importDefault(require("../models/Students"));
const studentSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).required(),
    surname: joi_1.default.string().min(3).max(30).required(),
    birthdate: joi_1.default.date().required(),
    rollno: joi_1.default.number().integer().min(1).required(),
    address: joi_1.default.string().min(5).required(),
    email: joi_1.default.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
    age: joi_1.default.number().integer().min(1).required(),
    profilePicture: joi_1.default.string().uri().optional(),
});
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// export const createStudent = async(req: Request, res: Response): Promise<void> => {
//     const { error } = studentSchema.validate({
//         name: req.body.name,
//         surname: req.body.surname,
//         birthdate: req.body.birthdate,
//         rollno: req.body.rollno,
//         address: req.body.address,
//         email: req.body.email,
//         age: req.body.age,
//         profilePicture: req.body.profilePicture
//     });
//     if (error) {
//         res.status(400).json({ message: error.details[0].message });
//         return;
//     }
//     // const newStudent = new StudentModel({
//     //     name: req.body.name,
//     //     surname: req.body.surname,
//     //     birthdate: req.body.birthdate,
//     //     rollno: req.body.rollno,
//     //     address: req.body.address,
//     //     email: req.body.email,
//     //     age: req.body.age,
//     //     profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
//     // });
//     // newStudent.save()
//     //     .then(student => res.json(student))
//     //     .catch(err => res.status(500).json({ message: 'Error creating student', error: err }));
//     try {
//         // Check if the email already exists
//         const existingStudent = await StudentModel.findOne({ email: req.body.email });
//         if (existingStudent) {
//             res.status(400).json({ message: "Email is already taken" });
//             return;
//         }
//         // Create new student
//         const newStudent = new StudentModel({
//             name: req.body.name,
//             surname: req.body.surname,
//             birthdate: req.body.birthdate,
//             rollno: req.body.rollno,
//             address: req.body.address,
//             email: req.body.email,
//             age: req.body.age,
//             profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
//         });
//         // Save student to the database
//         await newStudent.save();
//         res.status(201).json(newStudent); // Return the newly created student
//     } catch (err) {
//         console.error(err);
//         if (!res.headersSent) { // Ensure headers are not already sent before sending an error response
//             res.status(500).json({ message: 'Error creating student', error: err });
//         }
//     }
// };
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = studentSchema.validate(Object.assign({}, req.body));
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        // Check if the email already exists
        const existingStudent = yield Students_1.default.findOne({ email: req.body.email });
        if (existingStudent) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Create the new student
        const newStudent = new Students_1.default({
            name: req.body.name,
            surname: req.body.surname,
            birthdate: req.body.birthdate,
            rollno: req.body.rollno,
            address: req.body.address,
            email: req.body.email,
            age: req.body.age,
            profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
        });
        yield newStudent.save();
        res.status(201).json(newStudent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating student", error: err });
    }
});
exports.createStudent = createStudent;
const getStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 5, searchQuery, ageFilter } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        let query = {};
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
            const ageRange = ageFilter;
            const [minAge, maxAge] = ageRange.split('-');
            if (maxAge) {
                query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
            }
            else {
                query.age = { $gte: parseInt(minAge) };
            }
        }
        const students = yield Students_1.default.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalStudents = yield Students_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limitNumber);
        res.json({ students, totalPages });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching students" });
    }
});
exports.getStudents = getStudents;
const getStudentById = (req, res) => {
    const id = req.params.id;
    Students_1.default.findById({ _id: id })
        .then(student => res.json(student))
        .catch(err => res.status(500).json({ message: 'Error fetching student', error: err }));
};
exports.getStudentById = getStudentById;
// export const updateStudent = (req: Request, res: Response): void => {
//     const { error } = studentSchema.validate(req.body);
//     if (error) {
//         res.status(400).json({ message: error.details[0].message });
//         return;
//     }
//     const id = req.params.id;
//     const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;
//     StudentModel.findByIdAndUpdate({ _id: id }, {
//         name: req.body.name,
//         surname: req.body.surname,
//         birthdate: req.body.birthdate,
//         rollno: req.body.rollno,
//         address: req.body.address,
//         email: req.body.email,
//         age: req.body.age,
//         profilePicture: profilePicture
//     })
//         .then(student => res.json(student))
//         .catch(err => res.status(500).json({ message: 'Error updating student', error: err }));
// };
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = studentSchema.validate(Object.assign({}, req.body));
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        // Check if the email already exists and isn't the current student's email
        const existingStudent = yield Students_1.default.findOne({ email: req.body.email });
        if (existingStudent &&
            existingStudent._id.toString() !== req.params.id) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Update student
        const updatedStudent = yield Students_1.default.findByIdAndUpdate(req.params.id, Object.assign({}, req.body), { new: true });
        if (!updatedStudent) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        res.status(200).json(updatedStudent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating student", error: err });
    }
});
exports.updateStudent = updateStudent;
const deleteStudent = (req, res) => {
    const id = req.params.id;
    Students_1.default.findByIdAndDelete({ _id: id })
        .then(result => res.json({ success: true, result }))
        .catch(err => res.status(500).json({ message: 'Error deleting student', error: err }));
};
exports.deleteStudent = deleteStudent;
const checkEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, studentId } = req.body;
    try {
        let student;
        if (studentId) {
            student = yield Students_1.default.findOne({ email, _id: { $ne: studentId } });
        }
        else {
            student = yield Students_1.default.findOne({ email });
        }
        if (student) {
            res.status(400).json({ exists: true });
        }
        res.status(200).json({ exists: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        return;
    }
});
exports.checkEmail = checkEmail;
