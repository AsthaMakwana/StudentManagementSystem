import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Joi from 'joi';
import Navbar from '../client/Navbar';
import studentStore from '../../mobx/studentStore';
import { observer } from 'mobx-react';
import '../../assets/admin/CreateStudent.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateStudent() {

    const location = useLocation();
    const navigate = useNavigate();

    const [profilePicture, setProfilePicture] = useState(null);
    const { register, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm();

    const birthdate = watch("birthdate");

    const studentSchema = Joi.object({
        name: Joi.string().min(3).max(30).required().messages({ 'string.empty': 'Name is required', 'string.min': 'Name must be at least 3 characters long', 'any.required': 'Name is required' }),
        surname: Joi.string().min(3).max(30).required().messages({ 'string.empty': 'Surname is required', 'string.min': 'Surname must be at least 3 characters long', 'any.required': 'Surname is required' }),
        birthdate: Joi.date().required().messages({ 'date.base': 'Birthdate is required', 'any.required': 'Birthdate is required' }),
        rollno: Joi.number().integer().min(1).required().messages({ 'number.base': 'Roll number is required', 'number.empty': 'Roll number is required', 'number.min': 'Roll number must be at least 1', 'any.required': 'Roll number is required' }),
        address: Joi.string().min(5).required().messages({ 'string.empty': 'Address is required', 'string.min': 'Address must be at least 5 characters long', 'any.required': 'Address is required' }),
        email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required().messages({ 'string.pattern.base': 'Email must be valid', 'string.empty': 'Email is required', 'any.required': 'Email is required' }),
        age: Joi.number().integer().min(1).required().messages({ 'number.base': 'Age is required', 'number.empty': 'Age is required', 'number.min': 'Age must be at least 1', 'any.required': 'Age is required' }),
    });

    const calculateAge = (birthdate) => {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (birthdate) {
            const age = calculateAge(birthdate);
            setValue("age", age);
        }
    }, [birthdate, setValue]);

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const onSubmit = async (data) => {
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
        if (profilePicture) formData.append("profilePicture", profilePicture);

        try {
            await studentStore.createStudent(formData, token);
            navigate("/", {
                state: {
                    toastMessage: 'Student added successfully!',
                    page: location.state?.fromPage || 1
                }
            });
        } 
        catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Navbar />

            <div className="d-flex vh-70 justify-content-center align-items-center bg-overlay mt-5">
                <div className="card shadow-lg rounded-3 p-4" style={{ width: "90%", maxWidth: "800px", background: "rgba(255, 255, 255, 0.9)" }}>

                    <button className="btn btn-outline-primary mb-4 w-25" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}> ← Back
                    </button>

                    <form onSubmit={handleSubmit(onSubmit)} className="row g-4">
                        <ToastContainer />
                        <h2 className="text-center text-primary fw-bold mb-3">Add Student</h2>

                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label fw-bold text-secondary"> Name: </label>
                            <input type="text" {...register("name")} className="form-control" placeholder="Enter Name" />
                            {errors.name && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.name.message}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="surname" className="form-label fw-bold text-secondary"> Surname: </label>
                            <input type="text" {...register("surname")} className="form-control" placeholder="Enter Surname" />
                            {errors.surname && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.surname.message}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="birthdate" className="form-label fw-bold text-secondary"> Birthdate: </label>
                            <input type="date" {...register("birthdate")} className="form-control" />
                            {errors.birthdate && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.birthdate.message}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="rollno" className="form-label fw-bold text-secondary"> Roll No: </label>
                            <input type="number" {...register("rollno")} className="form-control" placeholder="Enter Roll No" />
                            {errors.rollno && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.rollno.message}</div>)}
                        </div>

                        <div className="col-12">
                            <label htmlFor="address" className="form-label fw-bold text-secondary"> Address: </label>
                            <textarea {...register("address")} className="form-control" placeholder="Enter Address"></textarea>
                            {errors.address && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.address.message}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="email" className="form-label fw-bold text-secondary"> Email: </label>
                            <input type="email" {...register("email")} className="form-control" placeholder="Enter Email" />
                            {errors.email && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.email.message}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="age" className="form-label fw-bold text-secondary"> Age: </label>
                            <input type="number" {...register("age")} className="form-control" readOnly />
                            {errors.age && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.age.message}</div>)}
                        </div>

                        <div className="col-12">
                            <label htmlFor="profilePicture" className="form-label fw-bold text-secondary"> Profile Picture: </label>
                            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                            {profilePicture && (<small className="text-muted mt-1"> Selected: {profilePicture.name}</small>)}
                        </div>

                        <div className="col-12 text-center">
                            <button className="btn btn-primary w-50 fw-bold py-2" style={{ fontSize: "1.1rem" }}>
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default observer(CreateStudent);
