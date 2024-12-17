import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
};

const studentSlice = createSlice({
  name: 'students',
  initialState,

  reducers: {

    setStudents(state, action) {
      state.students = action.payload;
    },

    deleteStudent(state, action) {
      state.students = state.students.filter(student => student._id !== action.payload);
    },

    addStudent(state, action) {
      state.students.push(action.payload);
    },
    
    updateStudent(state, action) {
      state.students = state.students.map(student =>
        student._id === action.payload._id ? action.payload : student
      );
    },
  },
});

export const { setStudents, deleteStudent, addStudent, updateStudent } = studentSlice.actions;
export default studentSlice.reducer;
