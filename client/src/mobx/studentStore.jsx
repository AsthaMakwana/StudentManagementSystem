import { makeAutoObservable } from "mobx";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class StudentStore {
  students = [];
  student = null;
  totalPages = 0;
  status = null;
  error = null;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  createStudent = async (formData, token) => {
    try {
      const email = formData.get("email");

      const emailCheckResponse = await axios.post(
        `${API_BASE_URL}/checkEmail`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (emailCheckResponse.data.exists) {
        throw new Error("Email already in use");
      }

      const response = await axios.post(`${API_BASE_URL}/createStudent`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.students.push(response.data);
    } catch (error) {
      this.error = error.message;
    }
  };

  updateStudent = async (id, formData, token) => {
    try {
      const email = formData.get("email");
      const emailCheckResponse = await axios.post(
        `${API_BASE_URL}/checkEmail`,
        { email, studentId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (emailCheckResponse.data.exists) {
        throw new Error("Email already in use");
      }

      const response = await axios.put(
        `${API_BASE_URL}/updateStudent/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const index = this.students.findIndex((student) => student._id === id);
      if (index !== -1) {
        
        this.students[index] = response.data;
      }
    } catch (error) {
      this.error = error.message;
    }
  };

  setStudents = async (currentPage, studentsPerPage, token, searchQuery, ageFilter) => {
    try {
      this.loading = true;
      const response = await axios.get(`${API_BASE_URL}/get-students`, {
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
    } catch (error) {
      this.loading = false;
      this.error = error.message;
    }
  };

  deleteStudent = async (id, token) => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteStudent/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.students = this.students.filter((student) => student._id !== id);
    } catch (error) {
      this.error = error.message;
    }
  };

  getStudentById = async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getStudent/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.student = response.data;
    } catch (error) {
      this.error = error.message;
    }
  };
}

export default new StudentStore();