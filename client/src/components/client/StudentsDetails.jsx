import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setStudents } from '../../redux/studentSlice';
import Navbar from './Navbar';
import '../../assets/client/StudentsDetails.css';

function StudentsDetails() {

    const { id } = useParams();
    const dispatch = useDispatch();
    const student = useSelector(state =>
        state.students.students.find(student => student._id === id)
    );

    useEffect(() => {
        if (!student) {
            const token = localStorage.getItem('authToken');
            axios.get(`http://localhost:3001/students/getStudent/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then(result => {
                    dispatch(setStudents([result.data]));
                })
                .catch(err => console.log(err));
        }
    }, [id, student, dispatch]);

    if (!student) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className='d-flex vh-100 justify-content-center align-items-center' style={{ position: 'relative' }}>
                <div className='w-75 bg-white rounded p-3'>
                    <h2 className="text-center">Student Details</h2>

                    <div className="card">
                        <div className="card-body">
                        <div className="mb-3">
                                <strong>Profile Picture:</strong>
                                {student.profilePicture ? (
                                    <img src={`http://localhost:3001${student.profilePicture}`} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>
                            <h3 className="card-title">Name: {student.name} {student.surname}</h3>
                            <p className="card-text"><strong>Roll No:</strong> {student.rollno}</p>
                            <p className="card-text"><strong>Age:</strong> {student.age}</p>
                            <p className="card-text"><strong>Birthdate:</strong> {new Date(student.birthdate).toLocaleDateString()}</p>
                            <p className="card-text"><strong>Email:</strong> {student.email}</p>
                            <p className="card-text"><strong>Address:</strong> {student.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentsDetails;