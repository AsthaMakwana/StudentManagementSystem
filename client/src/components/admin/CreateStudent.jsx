import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createStudentAsync } from '../../redux/studentSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Joi from 'joi';
import Navbar from '../client/Navbar';
import '../../assets/admin/CreateStudent.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateStudent() {

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState();
    const [surname, setSurname] = useState();
    const [birthdate, setBirthdate] = useState();
    const [rollno, setRollno] = useState();
    const [address, setAddress] = useState();
    const [email, setEmail] = useState();
    const [age, setAge] = useState();
    const [errors, setErrors] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);

    const studentSchema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        surname: Joi.string().min(3).max(30).required(),
        birthdate: Joi.date().required(),
        rollno: Joi.number().integer().min(1).required(),
        address: Joi.string().min(5).required(),
        email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
        age: Joi.number().integer().min(1).required(),
    });

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
            setAge(calculateAge(birthdate));
        }
    }, [birthdate])

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const Submit = (e) => {
        e.preventDefault();

        const { error } = studentSchema.validate(
            { name, surname, birthdate, rollno, address, email, age },
            { abortEarly: false }
        );

        if (error) {
            const newErrors = error.details.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {});
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const token = localStorage.getItem('authToken');

        const formData = new FormData();
        formData.append("name", name);
        formData.append("surname", surname);
        formData.append("birthdate", birthdate);
        formData.append("rollno", rollno);
        formData.append("address", address);
        formData.append("email", email);
        formData.append("age", age);
        if (profilePicture) formData.append("profilePicture", profilePicture);

        dispatch(createStudentAsync({ formData, token }))
            .unwrap()
            .then(() => {
                toast.success('Student added successfully!');
                setTimeout(() => {
                    navigate("/", { state: { page: location.state?.fromPage || 1 } });
                }, 2000);

            })
            .catch((error) => {
                if (error.email) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        email: error.email
                    }));
                } else {
                    console.error(error);
                }
            });
    };

    return (
        <div>
            <Navbar />
            <div className="d-flex vh-70 justify-content-center align-items-center bg-overlay mt-5">
                <div className="card shadow-lg rounded-3 p-4" style={{ width: "90%", maxWidth: "800px", background: "rgba(255, 255, 255, 0.9)" }}>

                    <button className="btn btn-outline-primary mb-4 w-25" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}> ← Back
                    </button>

                    <form onSubmit={Submit} className="row g-4">
                        <ToastContainer />
                        <h2 className="text-center text-primary fw-bold mb-3">Add Student</h2>

                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label fw-bold text-secondary"> Name: </label>
                            <input type="text" name="name" className="form-control" placeholder="Enter Name" onChange={(e) => setName(e.target.value)}/>
                            {errors.name && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.name}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="surname" className="form-label fw-bold text-secondary"> Surname: </label>
                            <input type="text" name="surname" className="form-control" placeholder="Enter Surname" onChange={(e) => setSurname(e.target.value)}/>
                            {errors.surname && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.surname}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="birthdate" className="form-label fw-bold text-secondary"> Birthdate: </label>
                            <input type="date" name="birthdate" className="form-control" onChange={(e) => setBirthdate(e.target.value)}/>
                            {errors.birthdate && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.birthdate}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="rollno" className="form-label fw-bold text-secondary"> Roll No: </label>
                            <input type="number" name="rollno" className="form-control" placeholder="Enter Roll No" onChange={(e) => setRollno(e.target.value)}/>
                            {errors.rollno && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.rollno}</div>)}
                        </div>

                        <div className="col-12">
                            <label htmlFor="address" className="form-label fw-bold text-secondary"> Address: </label>
                            <textarea name="address" className="form-control" placeholder="Enter Address" onChange={(e) => setAddress(e.target.value)}></textarea>
                            {errors.address && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.address}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="email" className="form-label fw-bold text-secondary"> Email: </label>
                            <input type="email" name="email" className="form-control" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)}/>
                            {errors.email && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.email}</div>)}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="age" className="form-label fw-bold text-secondary"> Age: </label>
                            <input type="number" name="age" className="form-control" value={age || ""} readOnly/>
                            {errors.age && (<div className="text-danger mt-1" style={{ fontSize: "0.9rem" }}>{errors.age}</div>)}
                        </div>

                        <div className="col-12">
                            <label htmlFor="profilePicture" className="form-label fw-bold text-secondary"> Profile Picture: </label>
                            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange}/>
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

export default CreateStudent;