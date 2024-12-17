const express = require('express');
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, checkEmail } = require('../controllers/studentController.js');
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/get-students',protect, getStudents);
router.get('/getStudent/:id', protect, getStudentById);
router.post("/createStudent", protect, adminOnly, upload.single("profilePicture"), createStudent);
router.put('/updateStudent/:id', protect, adminOnly, upload.single("profilePicture"), updateStudent);
router.delete('/deleteStudent/:id',protect, adminOnly, deleteStudent);
router.post('/checkEmail', protect, checkEmail);

module.exports = router;
