import { useNavigate, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../mobx/authStore";
import { Modal } from "react-bootstrap";
import React, { useState } from "react";

const Navbar: React.FC = observer(() => {
    const user = authStore.user;
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const handleLogout = (): void => {
        authStore.logout();
        navigate("/login");
        setShowModal(false);
    };

    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light shadow-sm px-4" style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                <div className="container-fluid">
                    <div className="d-flex w-100 align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Link to="/" className="navbar-brand">
                                <i className="fa fa-paw" style={{ fontSize: "1.8rem", color: "#343a40" }} />
                            </Link>
                        </div>

                        <div className="d-flex align-items-center">
                            {user ? (
                                <>
                                    <span className="navbar-text mr-3" style={{ fontSize: "1.1rem", fontWeight: "500", color: "#343a40", marginRight: "1rem" }}>
                                        Welcome, <strong>{user.username}</strong>
                                    </span>
                                    <button className="btn btn-danger rounded-pill px-4 py-2" onClick={handleModalShow} style={{ fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2" style={{ fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Body className="text-center">
                    <p>Are you sure you want to log out?</p>
                </Modal.Body>
                <Modal.Footer className=" justify-content-center">
                    <button className="btn btn-secondary mx-2" onClick={handleModalClose}>
                        Cancel
                    </button>
                    <button className="btn btn-danger mx-2" onClick={handleLogout}>
                        Logout
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default Navbar;
