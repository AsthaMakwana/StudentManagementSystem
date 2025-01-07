import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../assets/Layout.css';
import Navbar from './Navbar';
import React from 'react';

const Layout: React.FC = () => {
  return (
    <div className="d-flex vh-100">
      <Sidebar />
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
