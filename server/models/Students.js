const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    name: String,
    surname: String,
    birthdate: Date,
    rollno: Number,
    address: String,
    email: String,
    age: Number,
    profilePicture: String,
})

const StudentModel = mongoose.model("students", StudentSchema);
module.exports = StudentModel;