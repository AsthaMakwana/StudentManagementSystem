import { makeAutoObservable } from "mobx";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL;

interface IUser {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface IAuthError {
  error: string;
}

class AuthStore {
  token: string | null = localStorage.getItem('authToken') || null;
  user: IUser | null = null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' = 'idle';
  error: IAuthError | null = null;

  constructor() {
    makeAutoObservable(this);
    if (this.token) {
      this.loadUserFromToken();
    }
  }

  loadUserFromToken() {
    try {
      const decodedToken: IUser = jwtDecode(this.token!);
      this.user = decodedToken;
    }
    catch (error) {
      console.error("Failed to decode token:", error);
      this.token = null;
      localStorage.removeItem("authToken");
    }
  }

  async login(email: string, password: string) {
    this.status = 'loading';
    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, { email, password });
      this.token = response.data.token;
      this.user = response.data.user;
      if (this.token) {
        localStorage.setItem("authToken", this.token);
      }
      this.status = 'succeeded';
    }
    catch (err: any) {
      this.status = 'failed';
      this.error = err.response?.data || { error: 'Login failed' };
    }
  }

  async signup(username: string, email: string, password: string, role: 'user' | 'admin') {
    this.status = 'loading';
    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/signup`, { username, email, password, role });
      const loginResponse = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, { email, password });
      this.token = loginResponse.data.token;
      this.user = loginResponse.data.user;
      if (this.token) {
        localStorage.setItem("authToken", this.token);
      }
      this.status = 'succeeded';
    }
    catch (err: any) {
      this.status = 'failed';
      this.error = err.response?.data || { error: 'Signup failed' };
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

const authStore = new AuthStore();
export default authStore;

