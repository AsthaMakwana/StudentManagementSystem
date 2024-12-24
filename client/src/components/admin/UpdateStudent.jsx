import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Joi from 'joi';
import Navbar from '../client/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { updateStudentAsync, getStudentByIdAsync } from '../../redux/studentSlice';
import '../../assets/admin/CreateStudent.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdateStudent() {

    const { id } = useParams();
    const location = useLocation();
    const student = useSelector(state => state.students.student);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [name, setName] = useState();
    const [surname, setSurname] = useState();
    const [birthdate, setBirthdate] = useState();
    const [rollno, setRollno] = useState();
    const [address, setAddress] = useState();
    const [email, setEmail] = useState();
    const [age, setAge] = useState();
    const [errors, setErrors] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const studentSchema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        surname: Joi.string().min(3).max(30).required(),
        birthdate: Joi.date().required(),
        rollno: Joi.number().integer().min(1).required(),
        address: Joi.string().min(5).required(),
        email: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)).required(),
        age: Joi.number().integer().min(1).required(),
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        dispatch(getStudentByIdAsync({ id, token }));
    }, [dispatch, id]);

    useEffect(() => {
        if (student) {
            setName(student.name);
            setSurname(student.surname);
            setBirthdate(new Date(student.birthdate).toLocaleDateString('en-CA'));
            setRollno(student.rollno);
            setAddress(student.address);
            setEmail(student.email);
            setAge(student.age);
            setProfilePicture(student.profilePicture);
        }
    }, [student]);

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
        setSelectedFile(e.target.files[0]);
        setProfilePicture(null);
    };

    const Update = (e) => {
        e.preventDefault();

        const studentData = { name, surname, birthdate, rollno, address, email, age, profilePicture };
        
        const isUnchanged = Object.keys(studentData).every(key => {
            if (key === "birthdate") {
                return new Date(studentData[key]).toLocaleDateString() === new Date(student[key]).toLocaleDateString();
            }
            if (key === "profilePicture") {
                return studentData[key]?.split('/').pop() === student[key]?.split('/').pop();
            }
            return studentData[key] === student[key];
        });

        if (isUnchanged) {
            toast.info('No changes detected.');
            return;
        }

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
        if (selectedFile) formData.append("profilePicture", selectedFile);

        dispatch(updateStudentAsync({ id, formData, token }))
            .unwrap()
            .then(() => {
                toast.success('Student updated successfully!');
                setTimeout(() => {
                    navigate("/", { state: { page: location.state?.fromPage || 1 } });
                }, 2000);

            })
            .catch((error) => {
                console.error(error);
                if (error.exists) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        email: "Email is already in use"
                    }));
                } else {
                    console.error('Unexpected error:', error);
                }
            });

    };

    return (
        <div>
            <Navbar />
            <div className='d-flex vh-100 justify-content-center align-items-center' style={{ position: 'relative' }}>
                <div className='w-75 bg-white rounded p-3'>

                    <button className="btn btn-light mb-3" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ← Back
                    </button>

                    <form onSubmit={Update} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                        <ToastContainer />

                        <h2 style={{ textAlign: 'center', gridColumn: 'span 2' }}>Update Student</h2>

                        <div className='mb-2'>
                            <label htmlFor="">Name : </label>
                            <input type="text" name="name" className="form-control" placeholder='Enter Name' value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.name}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Surname : </label>
                            <input type="text" name="surname" className="form-control" placeholder='Enter Surname' value={surname} onChange={(e) => setSurname(e.target.value)} />
                            {errors.surname && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.surname}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Birthdate : </label>
                            <input type="date" name="birthdate" className="form-control" placeholder='Enter Birthdate' value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                            {errors.birthdate && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.birthdate}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Roll no : </label>
                            <input type="number" name="rollno" className="form-control" placeholder='Enter Rollno' value={rollno} onChange={(e) => setRollno(e.target.value)} />
                            {errors.rollno && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.rollno}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Address : </label>
                            <textarea type="text" name="address" className="form-control" placeholder='Enter Address' value={address} onChange={(e) => setAddress(e.target.value)} />
                            {errors.address && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.address}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Email : </label>
                            <input type="email" name="email" className="form-control" placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                            {errors.email && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.email}</div>}
                        </div>

                        <div className='mb-2'>
                            <label htmlFor="">Age : </label>
                            <input type="number" name="age" className="form-control" placeholder='Enter Age' value={age} readOnly />
                            {errors.age && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>{errors.age}</div>}
                        </div>

                        <div className="mb-2">
                            <label>Profile Picture: </label>
                            <div className="custom-file-input">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {profilePicture && !selectedFile && (
                                    <div>Current Profile Picture: {profilePicture.split('/').pop()}</div>
                                )}
                                {selectedFile && (
                                    <div>Selected: {selectedFile.name}</div>
                                )}
                            </div>
                        </div>
                        <button className='btn btn-success' style={{ gridColumn: 'span 2' }}>Update</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateStudent;