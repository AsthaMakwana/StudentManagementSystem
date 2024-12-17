// import { createStore, combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import studentReducer from './studentSlice';

// const rootReducer = combineReducers({
//     students: studentReducer,
//     auth: authReducer
// });
const store = configureStore({
    reducer: {
      students: studentReducer,
      auth: authReducer
    }
  });
  
  export default store;
