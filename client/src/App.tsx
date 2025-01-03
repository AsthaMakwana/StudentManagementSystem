import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginSignup from './components/client/LoginSignup';
import Students from './components/client/Students';
import CreateStudent from './components/admin/CreateStudent';
import UpdateStudent from './components/admin/UpdateStudent';
import './App.css';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC = () => {
  return (
    <div className="main-layout">
      <Outlet />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateStudent /></ProtectedRoute>} />
        <Route path="/update/:id" element={<ProtectedRoute><UpdateStudent /></ProtectedRoute>} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

