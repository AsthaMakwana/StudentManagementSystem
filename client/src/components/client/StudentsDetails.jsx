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
            <div className="student-details-container d-flex vh-100 justify-content-center align-items-center">
                <div className="details-card w-50 bg-light shadow-lg rounded p-4">

                    <button className="btn btn-outline-dark mb-4 back-button" onClick={() => navigate(`/`, { state: { page: location.state?.fromPage || 1 } })}>
                        ← Back
                    </button>

                    <h2 className="text-center mb-4">Student Details</h2>

                    <div className="card shadow border-0">
                        <div className="card-body">
                            <div className="profile-picture mb-4 text-center">
                                {student.profilePicture ? (
                                    <img src={`http://localhost:3001${student.profilePicture}`} alt="Profile" className="img-thumbnail rounded-circle" style={{ width: '100px', height: '100px' }} />
                                ) : (
                                    <div className="no-image">No Image</div>
                                )}
                            </div>
                            <h3 className="card-title">
                                {student.name} {student.surname}
                            </h3>
                            <div className="info-section mt-3">
                                <p><strong>Roll No:</strong> {student.rollno}</p>
                                <p><strong>Age:</strong> {student.age}</p>
                                <p><strong>Birthdate:</strong> {new Date(student.birthdate).toLocaleDateString()}</p>
                                <p><strong>Email:</strong> {student.email}</p>
                                <p><strong>Address:</strong> {student.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentsDetails;