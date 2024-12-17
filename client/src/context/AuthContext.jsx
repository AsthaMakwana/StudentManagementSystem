import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(null);
    const [user, setUser] = useState({});

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            const decoded = jwtDecode(storedToken);
            setUser({ token: storedToken, role: decoded.role, username: decoded.username });
        }
    }, [token]);

    const login = (token) => {
        setToken(token);
        localStorage.setItem('authToken', token);
        const decoded = jwtDecode(token);
        setUser({ token, role: decoded.role, username: decoded.username });
    };

    const logout = () => {
        setToken(null);
        setUser({});
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};