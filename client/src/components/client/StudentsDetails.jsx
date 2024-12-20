import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentByIdAsync } from '../../redux/studentSlice';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../../assets/client/StudentsDetails.css';

function StudentsDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const student = useSelector(state => state.students.student);
    const loading = useSelector(state => state.students.loading);
    const error = useSelector(state => state.students.error);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        dispatch(getStudentByIdAsync({ id, token }));
    }, [id, dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!student) {
        return <div>No student data found.</div>;
    }

    return (
        <div>
            <Navbar />
            <div className='d-flex vh-100 justify-content-center align-items-center' style={{ position: 'relative' }}>
                <div className='w-75 bg-white rounded p-3'>

                    <button className="btn btn-light mb-3" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ← Back
                    </button>

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