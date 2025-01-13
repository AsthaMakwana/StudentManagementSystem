import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaFileDownload, FaPlus, FaTrash } from 'react-icons/fa';
import StudentDetailsModal from './StudentDetailsModal';
import { toast, ToastContainer } from 'react-toastify';
import React, { useEffect, useRef, useState } from 'react';
import studentStore from '../../mobx/studentStore';
import 'react-toastify/dist/ReactToastify.css';
import authStore from '../../mobx/authStore';
import '../../assets/students/Students.css';
import { observer } from 'mobx-react-lite';
import { FiInfo } from 'react-icons/fi';

interface Student {
    _id: string;
    name: string;
    surname: string;
    rollno: number;
    age: number;
    birthdate: string;
    email: string;
    address: string;
    profilePicture?: string;
}

interface User {
    role: string;
}

const Students: React.FC = observer(() => {

    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(location.state?.page || 1);
    const [studentsPerPage] = useState<number>(5);
    const [ageFilter, setAgeFilter] = useState<string>('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const { students, totalPages, loading, setStudents, deleteStudent } = studentStore;
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setExcelFile(e.target.files[0]);
        }
    };

    const user: User | null = authStore.user;

    useEffect(() => {
        const token = localStorage.getItem("authToken") || "";
        setStudents(currentPage, studentsPerPage, token, searchQuery, ageFilter);
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString(undefined, options);
    };

    const handleSelectStudent = (id: string) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((studentId) =>
                studentId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const visibleIds = students.map((student: Student) => student._id);
            setSelectedStudentIds(visibleIds);
        }
        else {
            setSelectedStudentIds([]);
        }
    };

    const isAllSelected = (): boolean => {
        const visibleIds = students.map((student: Student) => student._id);
        return visibleIds.length > 0 && visibleIds.every((id) => selectedStudentIds.includes(id));
    };

    const handleBulkDelete = async () => {
        if (selectedStudentIds.length === 0) {
            toast.error('No students selected for deletion');
            return;
        }

        const isConfirmed = window.confirm("Are you sure you want to delete selected students?");
        if (isConfirmed) {
            const token = localStorage.getItem("authToken") || "";
            await Promise.all(selectedStudentIds.map((id) => deleteStudent(id, token)));
            const remainingStudents = students.filter(
                (student) => !selectedStudentIds.includes(student._id)
            );
            const isPageEmpty = remainingStudents.length === 0;
            setSelectedStudentIds([]);

            if (isPageEmpty && currentPage > 1) {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                await setStudents(newPage, studentsPerPage, token, searchQuery, ageFilter);
            }
            else {
                await setStudents(currentPage, studentsPerPage, token, searchQuery, ageFilter);
            }
            toast.success("Selected students deleted successfully");
        }
    };

    const handleDelete = async (id: string) => {

        const isConfirmed = window.confirm("Are you sure you want to remove this student?");
        if (isConfirmed) {
            const token = localStorage.getItem("authToken") || "";
            await deleteStudent(id, token);

            const remainingStudents = students.filter((student) => student._id !== id);
            const isPageEmpty = remainingStudents.length === 0;

            if (isPageEmpty && currentPage > 1) {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                await setStudents(newPage, studentsPerPage, token, searchQuery, ageFilter);
            }
            else {
                await setStudents(currentPage, studentsPerPage, token, searchQuery, ageFilter);
            }
            toast.success("Student deleted successfully");
        }
    };


    const handleShowStudentDetails = (student: Student) => {
        setSelectedStudent(student);
    }

    const paginate = (pageNumber: number) => {
        setCurrentPage(Math.min(pageNumber, totalPages));
    };
    const handleExport = async (format: 'csv' | 'excel') => {
        const token = localStorage.getItem('authToken') || '';
        await studentStore.exportStudents(format, searchQuery, ageFilter, token);
    };

    const handleImport = async () => {
        if (!excelFile) {
            alert('Please select an Excel file');
            return;
        }
        try {
            console.log("excel", excelFile);
            
            const token = localStorage.getItem('authToken') || '';
            const response = await studentStore.uploadExcel(excelFile, token);
            if (response?.status === 400) {
                toast.error(response.response.data.message);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setExcelFile(null);
            } else {
                toast.success('Students imported successfully!');
                setStudents(currentPage, studentsPerPage, token, searchQuery, ageFilter);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setExcelFile(null);
            }
        }
        catch (error: any) {
            console.error(error);
            if (error.response?.data?.errors) {
                toast.error(`Failed to import students:\n${error.response.data.errors.join('\n')}`);
            } else {
                alert('Failed to import students');
            }
        }
    };

    return (
        <div>
            <div className="logout-button"></div>
            <div className='p-2 d-flex gap-2 justify-content-end'>
                <button onClick={() => handleExport('csv')} className='btn btn-secondary btn-custom'>
                    <FaFileDownload className='me-2' /> CSV
                </button>
                <button onClick={() => handleExport('excel')} className='btn btn-secondary btn-custom'>
                    <FaFileDownload className='me-2' /> Excel
                </button>
            </div>
            <div className="table-container bg-white shadow rounded p-4">
                <ToastContainer />
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-center mb-0">Students</h1>
                    {user ? (
                        user.role === 'admin' && (
                            <div className="d-flex gap-2 align-items-center">
                                <Link to="/create" state={{ fromPage: currentPage }} className="btn btn-primary btn-custom">
                                    <FaPlus className="me-2" /> Add Student
                                </Link>
                                <button className="btn btn-danger btn-custom" onClick={handleBulkDelete}>
                                    <FaTrash className="me-2" /> Delete Selected
                                </button>
                                <button onClick={handleImport} className='btn btn-success btn-custom'>Import Students</button>
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="form-control-file" ref={fileInputRef} />
                            </div>
                        )
                    ) : (
                        <p>Please log in to see the dashboard.</p>
                    )}
                </div>

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

                <div className="table-responsive">
                    <table className="table table-bordered table-hover text-center align-middle">
                        <thead className="table-dark">
                            <tr>
                                {user && user.role === 'admin' && <th><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected()} /></th>}
                                <th>Profile Picture</th>
                                <th>Name</th>
                                <th>Roll no</th>
                                {user && user.role === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(students || []).map(student => (
                                <tr key={student._id}>
                                    {user && user.role === 'admin' && (
                                        <td><input type="checkbox" checked={selectedStudentIds.includes(student._id)} onChange={() => handleSelectStudent(student._id)} /></td>
                                    )}
                                    <td>
                                        {student.profilePicture ? (
                                            <img src={`http://localhost:3001${student.profilePicture}`} alt="Profile" className="rounded-circle" style={{ width: '50px', height: '50px' }} />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </td>
                                    <td>{student.name}</td>
                                    <td>{student.rollno}</td>
                                    {user && user.role === 'admin' && (
                                        <td>
                                            <Link to={`/update/${student._id}`} state={{ fromPage: currentPage }}>
                                                <button className="btn btn-light me-2" title="Edit">
                                                    <FaEdit size={20} />
                                                </button>
                                            </Link>
                                            <button className="btn btn-light me-2" title="More Info" onClick={() => handleShowStudentDetails(student)}>
                                                <FiInfo size={20} />
                                            </button>
                                            <button className="btn btn-light" title="Delete" onClick={() => handleDelete(student._id)}>
                                                <FaTrash size={20} />
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
                            <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
            <StudentDetailsModal student={selectedStudent} closeModal={() => setSelectedStudent(null)} />
        </div>
    )
});
export default Students;