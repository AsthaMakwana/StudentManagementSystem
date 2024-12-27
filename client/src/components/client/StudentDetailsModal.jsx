import React from 'react';
import { FaTimes } from 'react-icons/fa';

function StudentDetailsModal({ student, closeModal }) {
    if (!student) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={closeModal}>
                    <FaTimes size={20} />
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
    );
}

export default StudentDetailsModal;
