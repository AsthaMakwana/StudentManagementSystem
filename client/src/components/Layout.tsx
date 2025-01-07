import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../assets/Layout.css';

const Layout: React.FC = () => {

  return (
    <div className="d-flex vh-100">
      <div className="sidebar bg-dark text-white p-3">
        <h4>SchoolMate</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link text-white">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/students" className="nav-link text-white">Students</Link>
          </li>
        </ul>
      </div>
      <div className="flex-grow-1">
        <Navbar />
        <div className="content p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
