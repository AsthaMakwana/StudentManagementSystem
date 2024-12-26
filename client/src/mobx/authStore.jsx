import { makeAutoObservable } from "mobx";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL;

class AuthStore {
    token = localStorage.getItem('authToken') || null;
    user = null;
    status = 'idle';
    error = null;

    constructor() {
        makeAutoObservable(this);
        if (this.token) {
            this.loadUserFromToken();
        }
    }

    loadUserFromToken() {
        try {
            const decodedToken = jwtDecode(this.token);
            this.user = decodedToken;
        }
        catch (error) {
            console.error("Failed to decode token:", error);
            this.token = null;
            localStorage.removeItem("authToken");
        }
    }

    async login(email, password) {
        this.status = 'loading';
        try {
            const response = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, { email, password });
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('authToken', this.token);
            this.status = 'succeeded';
        }
        catch (err) {
            this.status = 'failed';
            this.error = err.response?.data || 'Login failed';
        }
    }

    async signup(username, email, password, role) {
        this.status = 'loading';
        try {
            const response = await axios.post(`${AUTH_API_BASE_URL}/auth/signup`, { username, email, password, role });
            const loginResponse = await axios.post(`${AUTH_API_BASE_URL}/auth/login`, { email, password });
            this.token = loginResponse.data.token;
            this.user = loginResponse.data.user;
            localStorage.setItem('authToken', this.token);
            this.status = 'succeeded';
        }
        catch (err) {
            this.status = 'failed';
            this.error = err.response?.data || 'Signup failed';
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
