import { makeAutoObservable } from "mobx";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface IStudent {
    _id: string;
    name: string;
    surname: string;
    birthdate: string;
    rollno: number;
    address: string;
    email: string;
    age: number;
    profilePicture?: string;
}

interface IStudentStore {
    students: IStudent[];
    student: IStudent | null;
    totalPages: number;
    status: string | null;
    error: string | null;
    loading: boolean;

    createStudent(formData: FormData, token: string): Promise<IStudent>;
    updateStudent(id: string, formData: FormData, token: string): Promise<AxiosResponse>;
    setStudents(currentPage: number, studentsPerPage: number, token: string, searchQuery: string, ageFilter: string): Promise<void>;
    deleteStudent(id: string, token: string): Promise<void>;
    getStudentById(id: string, token: string): Promise<void>;
}

class StudentStore implements IStudentStore {

    students: IStudent[] = [];
    student: IStudent | null = null;
    totalPages: number = 0;
    status: string | null = null;
    error: string | null = null;
    loading: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    createStudent = async (formData: FormData, token: string): Promise<IStudent> => {
        try {
            const response = await axios.post<IStudent>(`${API_BASE_URL}/createStudent`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.students.push(response.data);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                this.error = error.response?.data?.message || error.message;
            }
            else {
                this.error = (error as Error).message;
            }
            throw new Error(this.error || 'An unexpected error occurred');
        }
    };

    updateStudent = async (id: string, formData: FormData, token: string): Promise<AxiosResponse> => {
        try {
            const response = await axios.put<IStudent>(`${API_BASE_URL}/updateStudent/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const index = this.students.findIndex((student) => student._id === id);
            if (index !== -1) {
                this.students[index] = response.data;
            }
            return response;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    throw error.response.data;
                }
            }
            throw error;
        }
    };

    setStudents = async (currentPage: number, studentsPerPage: number, token: string, searchQuery: string, ageFilter: string): Promise<void> => {
        try {
            this.loading = true;
            const response = await axios.get<{
                students: IStudent[];
                totalPages: number;
            }>(`${API_BASE_URL}/get-students`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    limit: studentsPerPage,
                    searchQuery,
                    ageFilter,
                },
            });
            this.students = response.data.students;
            this.totalPages = response.data.totalPages;
            this.loading = false;
        }
        catch (error) {
            this.loading = false;
            this.error = (error as Error).message;
        }
    };

    deleteStudent = async (id: string, token: string): Promise<void> => {
        try {
            await axios.delete(`${API_BASE_URL}/deleteStudent/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.students = this.students.filter((student) => student._id !== id);
        }
        catch (error) {
            this.error = (error as Error).message;
        }
    };

    getStudentById = async (id: string, token: string): Promise<void> => {
        try {
            const response = await axios.get<IStudent>(`${API_BASE_URL}/getStudent/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.student = response.data;
        }
        catch (error) {
            this.error = (error as Error).message;
        }
    };
}

export default new StudentStore();