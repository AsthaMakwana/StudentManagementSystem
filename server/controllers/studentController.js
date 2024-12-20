const StudentModel = require('../models/Students');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');

const studentSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    surname: Joi.string().min(3).max(30).required(),
    birthdate: Joi.date().required(),
    rollno: Joi.number().integer().min(1).required(),
    address: Joi.string().min(5).required(),
    email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
    age: Joi.number().integer().min(1).required(),
    profilePicture: Joi.string().uri().optional()
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

exports.createStudent = (req, res) => {

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
        return res.status(400).json({ message: error.details[0].message });
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


exports.getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 5, searchQuery, ageFilter } = req.query;

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
            const [minAge, maxAge] = ageFilter.split('-');
            if (maxAge) {
                query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) };
            } else {
                query.age = { $gte: parseInt(minAge) };
            }
        }

        const students = await StudentModel.find(query)
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const totalStudents = await StudentModel.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limit);

        res.json({ students, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching students" });
    }
};


exports.getStudentById = (req, res) => {
    const id = req.params.id;
    StudentModel.findById({ _id: id })
        .then(student => res.json(student))
        .catch(err => res.status(500).json({ message: 'Error fetching student', error: err }));
};

exports.updateStudent = (req, res) => {

    const { error } = studentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
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

exports.deleteStudent = (req, res) => {
    const id = req.params.id;
    StudentModel.findByIdAndDelete({ _id: id })
        .then(result => res.json({ success: true, result }))
        .catch(err => res.status(500).json({ message: 'Error deleting student', error: err }));
};

exports.checkEmail = (req, res) => {
    const { email } = req.body;
    StudentModel.findOne({ email: email })
    
        .then(student => {
            if (student) {
                res.json({ exists: true });
            } else {
                res.json({ exists: false });
            }
        })
        .catch(err => res.status(500).json({ error: 'Internal Server Error', details: err }));
};
