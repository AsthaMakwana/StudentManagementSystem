import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const createStudentAsync = createAsyncThunk(
  'students/createStudent',
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const email = formData.get('email')

      const emailCheckResponse = await axios.post(`${API_BASE_URL}/checkEmail`, { email: email }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (emailCheckResponse.data.exists) {
        return rejectWithValue({ email: 'Email already in use' });
      }

      const response = await axios.post(`${API_BASE_URL}/createStudent`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateStudentAsync = createAsyncThunk(
  'students/updateStudent',
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const email = formData.get('email');
      const emailCheckResponse = await axios.post(`${API_BASE_URL}/checkEmail`, { email: email, studentId: id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (emailCheckResponse.data.exists) {
        return rejectWithValue({ email: 'Email already in use' });
      }

      const response = await axios.put(`${API_BASE_URL}/updateStudent/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const setStudentAsync = createAsyncThunk('students/getStudents', async ({ currentPage, studentsPerPage, token, searchQuery, ageFilter }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-students`, {
      
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        page: currentPage,
        limit: studentsPerPage,
        searchQuery,
        ageFilter,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
});


export const deleteStudentAsync = createAsyncThunk('students/deleteStudent', async ({ id, token }) => {
  try {
    await axios.delete(`${API_BASE_URL}/deleteStudent/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return id;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
});


export const getStudentByIdAsync = createAsyncThunk('students/getStudentById', async ({ id, token }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getStudent/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
});


const studentSlice = createSlice({
  name: 'students',
  initialState: {
    students: [],
    totalPages: 0,
    student: null,
    status: null,
    error: null,
  },

  reducers: {

    addStudent: (state, action) => {
      state.students.students.push(action.payload);
    },

    updateStudent: (state, action) => {
      const index = state.students.students.findIndex(student => student._id === action.payload._id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },

    setStudents(state, action) {
      state.students = action.payload;
    },

    deleteStudent(state, action) {
      state.students = state.students.filter(student => student._id !== action.payload);
    },
  },


  extraReducers: (builder) => {
    builder

      .addCase(createStudentAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createStudentAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.students.students.push(action.payload);
      })
      .addCase(createStudentAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      .addCase(updateStudentAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.students.students.findIndex(student => student._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(updateStudentAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      .addCase(setStudentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(setStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(setStudentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })


      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        const updatedStudents = state.students.students.filter(student => student._id !== action.payload);
        state.students.students = updatedStudents;
        if (updatedStudents.length === 0 && state.totalPages > 1) {
          state.totalPages -= 1;
        }
      })
      .addCase(deleteStudentAsync.rejected, (state, action) => {
        state.error = action.error.message;
      })


      .addCase(getStudentByIdAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStudentByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
      })
      .addCase(getStudentByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setStudents, deleteStudent, addStudent, updateStudent } = studentSlice.actions;
export default studentSlice.reducer;
