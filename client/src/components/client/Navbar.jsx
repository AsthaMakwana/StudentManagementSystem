import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../redux/authSlice';

const Navbar = () => {

    const user = useSelector((state) => state.auth.user);
    console.log('navbar',user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <div className="d-flex w-100 align-items-center justify-content-between">

                    {user ? (
                        <>
                            <span className="navbar-text me-3">
                                Welcome, {user.username}
                            </span>

                            <button className="btn btn-danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
