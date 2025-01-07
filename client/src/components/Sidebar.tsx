import { Link, useLocation } from "react-router-dom";
import "../assets/Sidebar.css";
import React from "react";

const Sidebar: React.FC = () => {
    const location = useLocation();
    return (
        <div className="sidebar bg-dark text-white p-3">
            <h4 className="sidebar-title mb-4 text-center">SchoolMate</h4>
            <ul className="nav flex-column">
                <li className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
                    <Link to="/dashboard" className="nav-link text-white">
                        <i className="fa fa-home mr-2"></i> Dashboard
                    </Link>
                </li>
                <li className={`nav-item ${location.pathname === "/students" ? "active" : ""}`}>
                    <Link to="/students" className="nav-link text-white">
                        <i className="fa fa-user-graduate mr-2"></i> Students
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
