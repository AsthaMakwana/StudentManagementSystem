import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, checkEmail, exportStudents } from '../controllers/studentController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, 'uploads/');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/get-students', protect, getStudents);
router.get('/getStudent/:id', protect, getStudentById);
router.post("/createStudent", protect, adminOnly, upload.single("profilePicture"), createStudent);
router.put('/updateStudent/:id', protect, adminOnly, upload.single("profilePicture"), updateStudent);
router.delete('/deleteStudent/:id', protect, adminOnly, deleteStudent);
router.post('/checkEmail', protect, checkEmail);
router.get('/export-students', protect, adminOnly, exportStudents);

export default router;
