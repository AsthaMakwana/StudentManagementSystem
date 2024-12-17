import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import Navbar from './Navbar';

import { useDispatch, useSelector } from 'react-redux';
import { setStudents, deleteStudent } from '../../redux/studentSlice';

function Students() {

    // const [students, setStudents] = useState([
    //     { Name: "Astha", Email: "astha@gmail.com", Age: 21 }
    // ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(5);

    const students = useSelector(state => state.students.students);
    console.log('dcddfedf',students)
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log(token);
        axios.get("http://localhost:3001/students/get-students", {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(result => {
                dispatch(setStudents(result.data));
            })
            .catch(err => console.log(err))
    }, [dispatch])

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    const handleDelete = (id) => {
        const isConfirmed = window.confirm("Are you sure you want to remove this student?");
        if (isConfirmed) {
            const token = localStorage.getItem('authToken');
            axios.delete('http://localhost:3001/students/deleteStudent/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then(() => {
                    dispatch(deleteStudent(id)); // Dispatch DELETE action to store
                })
                .catch(err => console.log(err));
        } else {
            console.log("Deletion canceled.");
        }
    }

    const filteredStudents = students.filter(student => {
        return (
            (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (student.surname && student.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const { token, logout, user } = useContext(AuthContext);

    return (
        <div>
            <Navbar />
            <div className="d-flex vh-100 justify-content-center align-items-center" style={{ position: 'relative' }}>
                <div className="logout-button"></div>
                <div className="w-75 bg-white rounded p-3">

                    <h1 style={{ textAlign: 'center' }}>Student Management System</h1>
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/create" className="btn btn-success mb-3">Add Student</Link>
                            )}
                        </>
                    ) : (
                        <p>Please log in to see the dashboard.</p>
                    )}

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, surname, or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className='table-responsive'>
                        <table className="table text-center">

                            <thead>
                                <tr>
                                    <th>Profile Picture</th>
                                    <th>Name</th>
                                    <th>Roll no</th>
                                    {user ? (
                                        <>
                                            {user.role === 'admin' && (
                                                <th>Actions</th>
                                            )}
                                        </>
                                    ) : (
                                        <p>Please log in to see the dashboard.</p>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    currentStudents.map((student) => {

                                        return (
                                            <tr key={student._id}>
                                                <td>
                                                    {student.profilePicture ? (
                                                        <img src={`http://localhost:3001${student.profilePicture}`} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                                    ) : (
                                                        <span>No Image</span>
                                                    )}
                                                </td>
                                                <td>{student.name}</td>
                                                <td>{student.rollno}</td>

                                                {user ? (
                                                    <>
                                                        {user.role === 'admin' && (

                                                            <td className="justify-content-center">

                                                                <Link to={`/update/${student._id}`}>
                                                                    <button className='btn btn-light me-2' title="Edit" style={{ border: 'none', background: 'transparent' }}>
                                                                        <FaEdit size={20} style={{ color: 'black' }} />
                                                                    </button>
                                                                </Link>

                                                                <Link to={`/details/${student._id}`}>
                                                                    <button className="btn btn-light" title="Details" style={{ border: 'none', background: 'transparent' }}>
                                                                        <FiInfo size={20} style={{ color: 'black' }} />
                                                                    </button>
                                                                </Link>

                                                                <button className='btn btn-light me-2' onClick={(e) => handleDelete(student._id)} title="Delete" style={{ border: 'none', background: 'transparent' }}>
                                                                    <FaTrash size={20} style={{ color: 'black' }} />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p>Please log in to see the dashboard.</p>
                                                )}
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <nav>
                        <ul className="pagination justify-content-center">
                            <li className="page-item" onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}>
                                <button className="page-link" aria-label="Previous">Previous</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li key={index + 1} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className="page-item" onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}>
                                <button className="page-link" aria-label="Next">Next</button>
                            </li>
                        </ul>
                    </nav>
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
                            opacity: 0.5;
                            z-index: -1;
                        }
                        .logout-button {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                        }
                        button:hover {
                            opacity: 0.7;
                            cursor: pointer;
                        }
                        button:focus {
                            outline: none; /* Removes the default focus outline */
                        }
                    `}
                </style>
            </div>
        </div>
    )
}

export default Students;