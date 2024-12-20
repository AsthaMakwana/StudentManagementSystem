import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import Navbar from './Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { setStudentAsync, deleteStudentAsync } from '../../redux/studentSlice';
import '../../assets/client/Students.css';
import { ToastContainer } from 'react-toastify';

function Students() {

    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(location.state?.page || 1);
    const [studentsPerPage] = useState(5);
    const [ageFilter, setAgeFilter] = useState('');

    const students = useSelector(state => state.students.students || []);
    const totalPages = useSelector(state => state.students.totalPages);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        dispatch(setStudentAsync({
            currentPage,
            studentsPerPage,
            token,
            searchQuery,
            ageFilter,
        }));
    }, [dispatch, currentPage, studentsPerPage, searchQuery, ageFilter]);


    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    const handleDelete = (id) => {
        const isConfirmed = window.confirm("Are you sure you want to remove this student?");
        if (isConfirmed) {
            const token = localStorage.getItem('authToken');
            dispatch(deleteStudentAsync({ id, token }))
                .then(() => {
                    dispatch(setStudentAsync({
                        currentPage,
                        studentsPerPage,
                        searchQuery,
                        token
                    }));
                });
        } else {
            console.log("Deletion canceled.");
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                                <Link to="/create" state={{ fromPage: currentPage }} className="btn btn-success mb-3">Add Student</Link>
                            )}
                        </>
                    ) : (
                        <p>Please log in to see the dashboard.</p>
                    )}

                    <div className="mb-3">
                        <label htmlFor="ageFilter" className="form-label">Filter by Age</label>
                        <select
                            id="ageFilter"
                            className="form-select"
                            onChange={(e) => setAgeFilter(e.target.value)}
                        >
                            <option value="">All Ages</option>
                            <option value="0-10">0-10</option>
                            <option value="11-20">11-20</option>
                            <option value="21-30">21-30</option>
                            <option value="31-40">31-40</option>
                            <option value="41-50">41-50</option>
                            <option value="51+">51+</option>
                        </select>
                    </div>


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
                                        <th><p>Please log in to see the dashboard.</p></th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {(students.students || []).map(student => (
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
                                        {user && user.role === 'admin' && (
                                            <td className="justify-content-center">
                                                <Link to={`/update/${student._id}`} state={{ fromPage: currentPage}}>
                                                    <button className='btn btn-light me-2' title="Edit">
                                                        <FaEdit size={20} style={{ color: 'black' }} />
                                                    </button>
                                                </Link>
                                                <Link to={`/details/${student._id}`} state={{ fromPage: currentPage }}>
                                                    <button className="btn btn-light" title="Details">
                                                        <FiInfo size={20} style={{ color: 'black' }} />
                                                    </button>
                                                </Link>
                                                <button className='btn btn-light me-2' onClick={() => handleDelete(student._id)} title="Delete">
                                                    <FaTrash size={20} style={{ color: 'black' }} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
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
                    <ToastContainer />
                </div>
            </div>
        </div>
    )
}

export default Students;