import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import studentReducer from './studentSlice';

const store = configureStore({
  reducer: {
    students: studentReducer,
    auth: authReducer
  }
});

export default store;
