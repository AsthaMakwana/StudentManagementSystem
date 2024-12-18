import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import Navbar from '../client/Navbar';
import { useDispatch } from 'react-redux';
import { updateStudent } from '../../redux/studentSlice';
import '../../assets/admin/CreateStudent.css';

function UpdateStudent() {

    const { id } = useParams();
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
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
        const token = localStorage.getItem('authToken');
        axios.get("http://localhost:3001/students/getStudent/" + id, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(result => {
                setName(result.data.name)
                setSurname(result.data.surname);
                const formattedBirthdate = new Date(result.data.birthdate).toLocaleDateString('en-CA');
                setBirthdate(formattedBirthdate)
                setRollno(result.data.rollno)
                setAddress(result.data.address)
                setEmail(result.data.email)
                setAge(result.data.age)
                setProfilePicture(result.data.profilePicture)
            })
            .catch(err => console.log(err))
    }, [])

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

        const { error } = studentSchema.validate({
            name, surname, birthdate, rollno, address, email, age
        }, { abortEarly: false });

        if (error) {
            const newErrors = error.details.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {});
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const formData = new FormData();
        formData.append('name', name);
        formData.append('surname', surname);
        formData.append('birthdate', birthdate);
        formData.append('rollno', rollno);
        formData.append('address', address);
        formData.append('email', email);
        formData.append('age', age);

        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }

        const token = localStorage.getItem('authToken');
        axios.put("http://localhost:3001/students/updateStudent/" + id, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(result => {
                dispatch(updateStudent(result.data));
                navigate('/');
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div>
            <Navbar />
            <div className='d-flex vh-100 justify-content-center align-items-center' style={{ position: 'relative' }}>
                <div className='w-75 bg-white rounded p-3'>

                    <button className="btn btn-light mb-3" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ← Back
                    </button>

                    <form onSubmit={Update} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

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