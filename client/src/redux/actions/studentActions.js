export const setStudents = (students) => ({
    type: 'SET_STUDENTS',
    payload: students
});

export const deleteStudent = (id) => ({
    type: 'DELETE_STUDENTS',
    payload: id
});

export const addStudent = (student) => ({
    type: 'ADD_STUDENT',
    payload: student
});

export const updateStudent = (student) => ({
    type: 'UPDATE_STUDENT',
    payload: student
});