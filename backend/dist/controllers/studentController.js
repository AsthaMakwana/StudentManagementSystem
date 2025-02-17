"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.importStudents = exports.exportStudents = exports.checkEmail = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const Students_1 = __importDefault(require("../models/Students"));
const exceljs_1 = require("exceljs");
const json2csv_1 = require("json2csv");
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const joi_1 = __importDefault(require("joi"));
const studentSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(30).required(),
    surname: joi_1.default.string().min(3).max(30).required(),
    birthdate: joi_1.default.date().required(),
    rollno: joi_1.default.number().integer().min(1).required().messages({
        "number.base": `"rollno" must be a valid number`,
        "number.empty": `"rollno" cannot be empty`,
        "any.required": `"rollno" is a required field`,
    }),
    address: joi_1.default.string().min(5).required(),
    email: joi_1.default.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
    age: joi_1.default.number().integer().min(1).required(),
    profilePicture: joi_1.default.string()
        .pattern(new RegExp('^\\/uploads\\/[a-zA-Z0-9._-]+\\.(jpg|jpeg|png|gif)$'))
        .optional(),
});
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage }).single('profilePicture');
const excelUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/excel_files');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            return cb(new Error('Please upload an excel file'));
        }
        cb(null, true);
    }
}).single('excelFile');
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = studentSchema.validate(Object.assign({}, req.body));
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const existingStudent = yield Students_1.default.findOne({ email: req.body.email });
        if (existingStudent) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
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
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = studentSchema.validate(Object.assign({}, req.body));
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const existingStudent = yield Students_1.default.findOne({ email: req.body.email });
        if (existingStudent && existingStudent._id.toString() !== req.params.id) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        const student = yield Students_1.default.findById(req.params.id);
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : student.profilePicture;
        const updatedStudent = yield Students_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { profilePicture }), { new: true });
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
const exportStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ageFilter, searchQuery, format = 'csv' } = req.query;
        let query = {};
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
            const ageRange = ageFilter;
            const [minAge, maxAge] = ageRange.split('-');
            if (maxAge) {
                query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
            }
            else {
                query.age = { $gte: parseInt(minAge) };
            }
        }
        const students = yield Students_1.default.find(query).lean();
        if (format === 'excel') {
            const workbook = new exceljs_1.Workbook();
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
            yield workbook.xlsx.write(res);
            res.end();
        }
        else if (format === 'csv') {
            const parser = new json2csv_1.Parser();
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
});
exports.exportStudents = exportStudents;
const importStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    excelUpload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (err) {
            res.status(400).json({ message: err.message });
            return;
        }
        try {
            const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!filePath) {
                res.status(400).json({ message: "File not found" });
                return;
            }
            const workbook = new exceljs_1.Workbook();
            yield workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0];
            const students = [];
            const errors = [];
            const existingEmails = new Set();
            worksheet.eachRow((row, rowIndex) => {
                var _a, _b, _c, _d, _e, _f, _g;
                if (rowIndex === 1)
                    return;
                const rollnoValue = ((_a = row.getCell(4).value) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                const rollno = parseInt(rollnoValue, 10);
                const emailValue = row.getCell(6).value;
                let email = '';
                if (emailValue) {
                    if (typeof emailValue === 'object' && 'text' in emailValue) {
                        email = emailValue.text;
                    }
                    else {
                        email = emailValue.toString() || '';
                    }
                }
                if (existingEmails.has(email)) {
                    errors.push(`Duplicate email found in row ${rowIndex}: ${email}`);
                    return;
                }
                existingEmails.add(email);
                let profilePicture = ((_b = row.getCell(8).value) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                if (profilePicture) {
                    const sourcePath = path_1.default.resolve(profilePicture);
                    if (fs.existsSync(sourcePath)) {
                        const destDir = path_1.default.join(__dirname, '..', '..', 'uploads', 'profile-pictures');
                        if (!fs.existsSync(destDir)) {
                            fs.mkdirSync(destDir, { recursive: true });
                        }
                        const destPath = path_1.default.join(destDir, path_1.default.basename(sourcePath));
                        fs.copyFileSync(sourcePath, destPath);
                        profilePicture = `/uploads/${path_1.default.basename(sourcePath)}`;
                    }
                    else {
                        errors.push(`Image file not found for student in row ${rowIndex}: ${profilePicture}`);
                        profilePicture = '';
                    }
                }
                const student = {
                    name: ((_c = row.getCell(1).value) === null || _c === void 0 ? void 0 : _c.toString()) || '',
                    surname: ((_d = row.getCell(2).value) === null || _d === void 0 ? void 0 : _d.toString()) || '',
                    birthdate: ((_e = row.getCell(3).value) === null || _e === void 0 ? void 0 : _e.toString()) || '',
                    rollno: isNaN(rollno) ? null : rollno,
                    address: ((_f = row.getCell(5).value) === null || _f === void 0 ? void 0 : _f.toString()) || '',
                    email: email,
                    age: parseInt(((_g = row.getCell(7).value) === null || _g === void 0 ? void 0 : _g.toString()) || '0', 10),
                    profilePicture,
                };
                const { error } = studentSchema.validate(student);
                if (error) {
                    errors.push(`Error in row ${rowIndex} (rollno: ${row.getCell(4).value}): ${error.details[0].message}`);
                }
                else {
                    students.push(student);
                }
            });
            if (errors.length > 0) {
                res.status(400).json({ message: "Validation errors in file", errors });
                return;
            }
            for (let student of students) {
                const existingStudent = yield Students_1.default.findOne({ email: student.email });
                if (existingStudent) {
                    errors.push(`Student with email ${student.email} already exists.`);
                }
            }
            if (errors.length > 0) {
                res.status(400).json({ message: "Duplicate students found", errors });
                return;
            }
            yield Students_1.default.insertMany(students);
            res.status(201).json({ message: "Students imported successfully", students });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error importing students", error });
        }
    }));
});
exports.importStudents = importStudents;
