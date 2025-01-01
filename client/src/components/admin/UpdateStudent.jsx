import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Joi from 'joi';
import Navbar from '../client/Navbar';
import studentStore from '../../mobx/studentStore';
import { observer } from 'mobx-react';
import '../../assets/admin/CreateStudent.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';

function UpdateStudent() {

    const { id } = useParams();
    const location = useLocation();
    const student = studentStore.student;
    const navigate = useNavigate();

    const [profilePicture, setProfilePicture] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const { register, handleSubmit, setValue, formState: { errors }, watch, setError, getValues } = useForm();
    const birthdate = watch("birthdate");
    const watchedData = watch();
    const initialData = student;

    const studentSchema = Joi.object({
        name: Joi.string().min(3).max(30).required().messages({ 'string.empty': 'Name is required', 'string.min': 'Name must be at least 3 characters long', 'any.required': 'Name is required' }),
        surname: Joi.string().min(3).max(30).required().messages({ 'string.empty': 'Surname is required', 'string.min': 'Surname must be at least 3 characters long', 'any.required': 'Surname is required' }),
        birthdate: Joi.date().required().messages({ 'date.base': 'Birthdate is required', 'any.required': 'Birthdate is required' }),
        rollno: Joi.number().integer().min(1).required().messages({ 'number.base': 'Roll number is required', 'number.empty': 'Roll number is required', 'number.min': 'Roll number must be at least 1', 'any.required': 'Roll number is required' }),
        address: Joi.string().min(5).required().messages({ 'string.empty': 'Address is required', 'string.min': 'Address must be at least 5 characters long', 'any.required': 'Address is required' }),
        email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required().messages({ 'string.pattern.base': 'Email must be valid', 'string.empty': 'Email is required', 'any.required': 'Email is required' }),
        age: Joi.number().integer().min(1).required().messages({ 'number.base': 'Age is required', 'number.empty': 'Age is required', 'number.min': 'Age must be at least 1', 'any.required': 'Age is required' }),
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        studentStore.getStudentById(id, token);
    }, [id]);

    useEffect(() => {
        if (student) {
            setValue("name", student.name);
            setValue("surname", student.surname);
            setValue("birthdate", new Date(student.birthdate).toLocaleDateString('en-CA'));
            setValue("rollno", student.rollno);
            setValue("address", student.address);
            setValue("email", student.email);
            setValue("age", student.age);
            setProfilePicture(student.profilePicture);
        }
    }, [student, setValue]);

    const calculateAge = (birthdate) => {
        const birthDate = new Date(birthdate);
        const today = new Date;
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    useEffect(() => {
        if (birthdate) {
            setValue("age", calculateAge(birthdate));
        }
    }, [birthdate, setValue]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setProfilePicture(null);
    };

    const onSubmit = (data) => {
        const isUnchanged = Object.keys(watchedData).every((key) => {
            if (key === "birthdate") {
                return new Date(watchedData[key]).toLocaleDateString() === new Date(initialData[key]).toLocaleDateString();
            }
            if (key === "profilePicture") {
                return !selectedFile && watchedData[key] === initialData[key];
            }
            return watchedData[key] === initialData[key];
        });

        if (!selectedFile && isUnchanged) {
            toast.info('No changes detected.');
            return;
        }

        const { error } = studentSchema.validate(data, { abortEarly: false });
        if (error) {
            const newErrors = error.details.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {});
            for (const field in newErrors) {
                setError(field, { message: newErrors[field] });
            }
            return;
        }

        const token = localStorage.getItem('authToken');
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        if (selectedFile) formData.append("profilePicture", selectedFile);

        studentStore.updateStudent(id, formData, token)
            .then(() => {
                navigate("/", {
                    state: {
                        toastMessage: 'Student updated successfully!',
                        page: location.state?.fromPage || 1
                    }
                });
            })
            .catch((error) => {
                if (error.message) {
                    setError("email", { message: error.message || 'Email is already taken' });
                } else {
                    toast.error('Unexpected error occurred.');
                }
            });
    };

    return (

        <div>
            <Navbar />

            <div className='d-flex vh-70 justify-content-center align-items-center bg-overlay mt-5'>
                <div className="card shadow-lg rounded-3 p-4" style={{ width: "90%", maxWidth: "800px", background: "rgba(255, 255, 255, 0.9)" }}>

                    <button className="btn btn-outline-primary mb-4 w-25" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}> ← Back
                    </button>

                    <form onSubmit={handleSubmit(onSubmit)} className="row g-4">

                        <h2 className="text-center text-primary fw-bold mb-3">Update Student</h2>

                        <div className='col-md-6'>
                            <label htmlFor="">Name : </label>
                            <input type="text" {...register("name")} className="form-control" placeholder='Enter Name' />
                            {errors.name && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.name.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Surname : </label>
                            <input type="text" {...register("surname")} className="form-control" placeholder='Enter Surname' />
                            {errors.surname && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.surname.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Birthdate : </label>
                            <input type="date" {...register("birthdate")} className="form-control" placeholder='Enter Birthdate' />
                            {errors.birthdate && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.birthdate.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Roll no : </label>
                            <input type="number" {...register("rollno")} className="form-control" placeholder='Enter Rollno' />
                            {errors.rollno && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.rollno.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Address : </label>
                            <textarea type="text" {...register("address")} className="form-control" placeholder='Enter Address' />
                            {errors.address && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.address.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Email : </label>
                            <input type="email" {...register("email")} className="form-control" placeholder='Enter Email' />
                            {errors.email && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.email.message}</div>}
                        </div>

                        <div className='col-md-6'>
                            <label htmlFor="">Age : </label>
                            <input type="number" {...register("age")} className="form-control" placeholder='Enter Age' readOnly />
                            {errors.age && <div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.age.message}</div>}
                        </div>

                        <div className="col-12">
                            <label>Profile Picture: </label>
                            <div className="custom-file-input">
                                <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                                {profilePicture && !selectedFile && (
                                    <div>Current Profile Picture: {profilePicture.split('/').pop()}</div>
                                )}
                                {selectedFile && (
                                    <div>Selected: {selectedFile.name}</div>
                                )}
                            </div>
                        </div>

                        <div className="col-12 text-center">
                            <button className="btn btn-primary w-50 fw-bold py-2" style={{ fontSize: "1.1rem" }}>
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default observer(UpdateStudent);