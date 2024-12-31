"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
mongoose_1.default.connect("mongodb://127.0.0.1:27017/mern")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));
app.use('/api/auth', authRoutes_1.default);
app.use('/students', studentRoutes_1.default);
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
