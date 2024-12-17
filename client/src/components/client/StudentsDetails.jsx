import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setStudents } from '../../redux/studentSlice';

import Navbar from './Navbar';

function StudentsDetails() {

    const { id } = useParams();

    const dispatch = useDispatch();

    // const [student, setStudent] = useState(null);
    const student = useSelector(state =>
        state.studentReducer.students.find(student => student._id === id)
    );

    // useEffect(() => {
    //     const token = localStorage.getItem('authToken');
    //     axios.get(`http://localhost:3001/students/getStudent/${id}`, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //         }
    //     })
    //         .then(result => {
    //             setStudent(result.data);
    //         })
    //         .catch(err => console.log(err));
    // }, [id]);
    useEffect(() => {
        if (!student) {
            // If student is not found in Redux, fetch it from the server
            const token = localStorage.getItem('authToken');
            axios.get(`http://localhost:3001/students/getStudent/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then(result => {
                    dispatch(setStudents([result.data])); // Dispatch the fetched student data to Redux
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

                <style>
                    {`
                        .d-flex::before {
                            content: "";
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-image: url("https://www.oxfordlearning.com/wp-content/uploads/2018/09/how-to-help-your-child-focus-in-school-860x420.jpeg");
                            background-size: cover;
                            background-repeat: no-repeat;
                            opacity: 0.5; /* Set the opacity for the background image */
                            z-index: -1; /* Keeps the image behind the content */
                        }
                    `}
                </style>
            </div>
        </div>
    );
}

export default StudentsDetails;