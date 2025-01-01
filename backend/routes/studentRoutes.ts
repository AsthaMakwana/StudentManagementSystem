import express, { Request } from 'express';
import multer from 'multer';
import path from 'path';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, checkEmail } from '../controllers/studentController';

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

export default router;
