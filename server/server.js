const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect("mongodb://127.0.0.1:27017/mern");

// const studentSchema = Joi.object({
//     name: Joi.string().min(3).max(30).required(),
//     surname: Joi.string().min(3).max(30).required(),
//     birthdate: Joi.date().required(),
//     rollno: Joi.number().integer().min(1).required(),
//     address: Joi.string().min(5).required(),
//     email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
//     age: Joi.number().integer().min(1).required(),
//     profilePicture: Joi.string().uri().optional()
// });

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// app.get('/', (req, res)=>{
//     StudentModel.find({})
//     .then(students => res.json(students))
//     .catch(err => console.log(err))
// })

// app.get('/getStudent/:id', (req, res)=>{
//     const id = req.params.id;
//     StudentModel.findById({_id:id})
//     .then(students => res.json(students))
//     .catch(err => console.log(err))
// })

// app.put('/updateStudent/:id',upload.single("profilePicture"), (req, res)=>{
//     const { error } = studentSchema.validate(req.body);
//     if (error) {
//         return res.status(400).json({ message: error.details[0].message });
//     }
//     const id = req.params.id;
//     const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;
//     StudentModel.findByIdAndUpdate({_id: id}, {
//         name: req.body.name,
//         surname: req.body.surname,
//         birthdate: req.body.birthdate,
//         rollno: req.body.rollno,
//         address: req.body.address,
//         email: req.body.email, 
//         age: req.body.age,
//         profilePicture: profilePicture,
//     })
//     .then(students => res.json(students))
//     .catch(err => console.log(err))
// })

// app.delete('/deleteStudent/:id', (req, res) => {
//     const id = req.params.id;
//     StudentModel.findByIdAndDelete({_id: id})
//     .then(result => res.json({ success: true, result }))

// })

// app.post("/createStudent", upload.single("profilePicture"), (req, res) => {
//     const { error } = studentSchema.validate({
//         name: req.body.name,
//         surname: req.body.surname,
//         birthdate: req.body.birthdate,
//         rollno: req.body.rollno,
//         address: req.body.address,
//         email: req.body.email,
//         age: req.body.age,
//         profilePicture: req.body.profilePicture,
//     });
//     console.log(req.profilePicture)

//     if (error) {
//         return res.status(400).json({ message: error.details[0].message });
//     }

//     const newStudent = new StudentModel({
//         name: req.body.name,
//         surname: req.body.surname,
//         birthdate: req.body.birthdate,
//         rollno: req.body.rollno,
//         address: req.body.address,
//         email: req.body.email,
//         age: req.body.age,
//         profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
//     });

//     newStudent
//         .save()
//         .then((student) => res.json(student))
//         .catch((err) => res.status(500).json({ message: 'Error creating student', error: err }));
// });

// app.post('/checkEmail', (req, res) => {
//     const { email } = req.body;
//     StudentModel.findOne({ email: email })
//         .then(student => {
//             if (student) {
//                 res.json({ exists: true });
//             } else {
//                 res.json({ exists: false });
//             }
//         })
//         .catch(err => {
//             res.status(500).json({ error: 'Internal Server Error' });
//         });
// });

app.use('/api/auth', authRoutes);
app.use('/students', studentRoutes);

app.listen(3001, ()=>{
    console.log("Server is running on port 3001");
})