import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('authToken') || null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {

    login(state, action) {
      state.user = action.payload.user;
      localStorage.setItem('authToken', action.payload.token);
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem('authToken');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
