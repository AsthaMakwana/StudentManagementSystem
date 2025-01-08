"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const router = express_1.default.Router();
router.get('/get-students', authMiddleware_1.protect, studentController_1.getStudents);
router.get('/getStudent/:id', authMiddleware_1.protect, studentController_1.getStudentById);
router.post("/createStudent", authMiddleware_1.protect, authMiddleware_1.adminOnly, upload.single("profilePicture"), studentController_1.createStudent);
router.put('/updateStudent/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, upload.single("profilePicture"), studentController_1.updateStudent);
router.delete('/deleteStudent/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, studentController_1.deleteStudent);
router.post('/checkEmail', authMiddleware_1.protect, studentController_1.checkEmail);
router.get('export-students', authMiddleware_1.protect, authMiddleware_1.adminOnly, studentController_1.exportStudents);
exports.default = router;
