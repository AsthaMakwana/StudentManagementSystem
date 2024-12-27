import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import Navbar from './Navbar';
import { observer } from 'mobx-react-lite';
import studentStore from '../../mobx/studentStore';
import '../../assets/client/Students.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentDetailsModal from './StudentDetailsModal';
import authStore from '../../mobx/authStore';

const Students = observer(() => {

    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(location.state?.page || 1);
    const [studentsPerPage] = useState(5);
    const [ageFilter, setAgeFilter] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { students, totalPages, loading, setStudents, deleteStudent } = studentStore;
    const user = authStore.user;

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setStudents(
            currentPage,
            studentsPerPage,
            token,
            searchQuery,
            ageFilter,
        );
    }, [currentPage, searchQuery, ageFilter, setStudents]);

    useEffect(() => {
        if (location.state?.toastMessage) {
            toast.success(location.state.toastMessage);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    const handleSelectStudent = (id) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const visibleIds = students.map((student) => student._id);
            setSelectedStudentIds((prev) => [...new Set([...prev, ...visibleIds])]);
        } else {
            const visibleIds = students.map((student) => student._id);
            setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
        }
    };

    const isAllSelected = () => {
        const visibleIds = students.map((student) => student._id);
        return visibleIds.every((id) => selectedStudentIds.includes(id));
    };

    const handleBulkDelete = () => {
        const token = localStorage.getItem('authToken');
        if (selectedStudentIds.length > 0) {
            const isConfirmed = window.confirm(
                'Are you sure you want to delete selected students?'
            );
            if (isConfirmed) {
                selectedStudentIds.forEach((id) => {
                    deleteStudent(id, token);
                });
                setTimeout(() => {
                    setSelectedStudentIds([]);
                    setStudents(
                        currentPage,
                        studentsPerPage,
                        searchQuery,
                        ageFilter,
                        token,
                    );
                    navigate("/", { state: { page: location.state?.fromPage || 1 } });
                }, 500);
            }
        } else {
            toast.error('No students selected for deletion!');
        }
    };

    const handleDelete = (id) => {
        const isConfirmed = window.confirm("Are you sure you want to remove this student?");
        if (isConfirmed) {
            const token = localStorage.getItem('authToken');
            deleteStudent(id, token);
            setStudents(
                currentPage,
                studentsPerPage,
                searchQuery,
                token,
            );
            toast.success('Student deleted successfully!');
            setTimeout(() => {
                navigate("/", { state: { page: location.state?.fromPage || 1 } });
            }, 1000);
        }
    };

    const handleShowStudentDetails = (student) => {
        setSelectedStudent(student);
    };

    const paginate = (pageNumber) => {
        if (pageNumber > totalPages) {
            setCurrentPage(totalPages);
        } else {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="d-flex vh-100 justify-content-center align-items-center" style={{ position: 'relative' }}>
                <div className="logout-button"></div>
                <div className="w-75 bg-white rounded p-3">
                    <ToastContainer />
                    <h1 style={{ textAlign: 'center' }}>Student Management System</h1>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/create" state={{ fromPage: currentPage }} className="btn btn-success mb-3">Add Student</Link>
                                    <button className="btn btn-danger mb-3 ms-3" onClick={handleBulkDelete}>
                                        Delete Selected
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <p>Please log in to see the dashboard.</p>
                    )}

                    <div className="mb-3">
                        <label htmlFor="ageFilter" className="form-label">Filter by Age</label>
                        <select id="ageFilter" className="form-select" onChange={(e) => setAgeFilter(e.target.value)}>
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
                        <input type="text" className="form-control" placeholder="Search by name, surname, or email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div className='table-responsive'>
                        <table className="table text-center">
                            <thead>
                                <tr>
                                    {user && user.role === 'admin' && (
                                        <th>
                                            <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected()} />
                                        </th>
                                    )}
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
                                {(students || []).map(student => (
                                    <tr key={student._id}>
                                        {user && user.role === 'admin' && (
                                            <td>
                                                <input type="checkbox" checked={selectedStudentIds.includes(student._id)} onChange={() => handleSelectStudent(student._id)} />
                                            </td>
                                        )}
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
                                                <Link to={`/update/${student._id}`} state={{ fromPage: currentPage }}>
                                                    <button className='btn btn-light me-2' title="Edit">
                                                        <FaEdit size={20} style={{ color: 'black' }} />
                                                    </button>
                                                </Link>
                                                <button className='btn btn-light me-2' title="More Info" onClick={() => handleShowStudentDetails(student)}>
                                                    <FiInfo size={20} />
                                                </button>
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
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" aria-label="Previous" onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1}>
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li key={index + 1} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    aria-label="Next"
                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            <StudentDetailsModal student={selectedStudent} closeModal={() => setSelectedStudent(null)} />
        </div>
    )
});

export default Students;