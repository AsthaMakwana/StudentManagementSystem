import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../../mobx/authStore";

const Navbar: React.FC = observer(() => {
    const user = authStore.user;
    const navigate = useNavigate();

    const handleLogout = (): void => {
        authStore.logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: "#ffffff", padding: "1rem 1.5rem", borderBottom: "2px solid #f0f0f0" }}>
            <div className="container-fluid">
                <div className="d-flex w-100 align-items-center">
                    {user ? (
                        <>
                            <span className="navbar-text" style={{ fontSize: "1rem", fontWeight: "bold", color: "#333333" }}>
                                Welcome, {user.username}
                            </span>
                            <div style={{ marginLeft: "auto" }}>
                                <button className="btn btn-outline-dark" onClick={handleLogout} style={{ padding: "0.5rem 1.5rem", borderRadius: "30px", fontWeight: "bold", fontSize: "0.9rem" }}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ marginLeft: "auto" }}>
                            <Link to="/login" className="btn btn-dark" style={{ padding: "0.5rem 1.5rem", borderRadius: "30px", fontWeight: "bold", fontSize: "0.9rem" }}>
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navbar;
