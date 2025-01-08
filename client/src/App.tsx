import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import CreateStudent from './components/students/CreateStudent';
import UpdateStudent from './components/students/UpdateStudent';
import LoginSignup from './components/auth/LoginSignup';
import Dashboard from './components/students/Dashboard';
import Students from './components/students/Students';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import React from 'react';
import './App.css';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="create" element={<CreateStudent />} />
          <Route path="update/:id" element={<UpdateStudent />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

