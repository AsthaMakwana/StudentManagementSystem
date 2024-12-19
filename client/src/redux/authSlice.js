import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL;


const initialState = {
  token: localStorage.getItem('authToken') || null,
  user: null,
  status: 'idle',
  error: null
};


export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const signupAsync = createAsyncThunk(
  'auth/signupAsync',
  async ({ username, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/signup`, {
        username,
        email,
        password,
        role,
      });
      const loginResponse = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      return loginResponse.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('authToken');
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      .addCase(signupAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
