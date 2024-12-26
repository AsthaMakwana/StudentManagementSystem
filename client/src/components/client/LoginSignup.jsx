import React, { useState, useEffect } from 'react';
import '../../assets/client/LoginSignup.css';
import { observer } from 'mobx-react-lite';
import authStore from '../../mobx/authStore';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const LoginSignup = () => {

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const [isNavigated, setIsNavigated] = useState(false);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('authToken');
    if (tokenFromStorage && !isNavigated) {
      navigate('/');
      setIsNavigated(true);
    }
  }, [isNavigated, navigate]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authStore.login(loginData.email, loginData.password);
      if (authStore.status === 'succeeded') {
        toast.success('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(authStore.error);
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await authStore.signup(signupData.username, signupData.email, signupData.password, signupData.role);
      if (authStore.status === 'succeeded') {
        toast.success('Signup successful!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(authStore.error);
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (

    <div className="container w-50">
      <div className={`login form ${isLoginMode ? 'active' : ''}`}>
        <header>Login</header>

        <form onSubmit={handleLogin}>

          <input type="email" name="email" placeholder="Enter your email" value={loginData.email} onChange={handleLoginChange} required />
          <input type="password" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required />

          {error && <div className="error">{error}</div>}

          <input type="submit" className="button" value="Login" />

        </form>

        <div className="signup">
          <span className="signup">
            Don't have an account?
            <label onClick={() => setIsLoginMode(false)}>Signup</label>
          </span>
        </div>
      </div>

      <div className={`registration form ${!isLoginMode ? 'active' : ''}`}>
        <header>Signup</header>

        <form onSubmit={handleSignup}>

          <input type="text" name="username" placeholder="Enter your username" value={signupData.username} onChange={handleSignupChange} required/>
          <input type="email" name="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required/>
          <input type="password" name="password" placeholder="Create a password" value={signupData.password} onChange={handleSignupChange} required/>

          <select name="role" value={signupData.role} onChange={handleSignupChange} required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {error && <div className="error">{error}</div>}

          <input type="submit" className="button" value="Signup" />

        </form>

        <div className="signup">
          <span className="signup">
            Already have an account?
            <label onClick={() => setIsLoginMode(true)}>Login</label>
          </span>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginSignup;
