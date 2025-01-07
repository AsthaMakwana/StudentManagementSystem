import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import authStore from '../../mobx/authStore';
import '../../assets/auth/LoginSignup.css';
import { observer } from 'mobx-react-lite';
import Joi from 'joi';

interface ILoginSignupForm {
  email: string;
  password: string;
  username?: string;
  role?: 'user' | 'admin';
}

const LoginSignup: React.FC = () => {

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { register, handleSubmit, setError, reset, formState: { errors }, setValue } = useForm<ILoginSignupForm>();
  const [isNavigated, setIsNavigated] = useState<boolean>(false);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('authToken');
    if (tokenFromStorage && !isNavigated) {
      navigate('/');
      setIsNavigated(true);
    }
  }, [isNavigated, navigate]);

  const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({ 'string.email': 'Invalid email', 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).required().messages({ 'string.min': 'Password must be at least 6 characters', 'string.empty': 'Password is required' }),
  });

  const signupSchema = Joi.object({
    username: Joi.string().min(3).required().messages({ 'string.min': 'Username must be at least 3 characters', 'string.empty': 'Username is required' }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({ 'string.email': 'Invalid email', 'string.empty': 'Email is required' }),
    password: Joi.string().min(6).required().messages({ 'string.min': 'Password must be at least 6 characters', 'string.empty': 'Password is required' }),
    role: Joi.string().valid('user', 'admin').required().messages({ 'any.only': 'Invalid role', 'string.empty': 'Role is required' }),
  });

  const validateForm = (data: FieldValues, schema: Joi.ObjectSchema) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      error.details.forEach((detail) => {
        setError(detail.path[0] as keyof typeof errors, { type: 'manual', message: detail.message });
      });
      return false;
    }
    return true;
  };

  const handleLogin: SubmitHandler<ILoginSignupForm> = async (data) => {
    if (!validateForm(data, loginSchema)) return;
    try {
      await authStore.login(data.email, data.password);
      if (authStore.status === 'succeeded') {
        toast.success('Login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
      else {
        toast.error(authStore.error?.error || 'Error during login.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error during login. Please try again later.';
      setError('email', { type: 'manual', message: errorMessage });
      setError('password', { type: 'manual', message: errorMessage });
    }
  };

  const handleSignup: SubmitHandler<ILoginSignupForm> = async (data) => {
    if (!validateForm(data, signupSchema)) return;
    try {
      await authStore.signup(data.username!, data.email, data.password, data.role!);
      if (authStore.status === 'succeeded') {
        toast.success('Signup successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
      else {
        toast.error(authStore.error?.error || 'Error during signup.');
      }
    }
    catch (error: any) {
      const errorMessage = error.response?.data?.error || 'User/Admin already exists';
      if (errorMessage.includes('username')) {
        setError('username', { type: 'manual', message: errorMessage });
      }
      else if (errorMessage.includes('email')) {
        setError('email', { type: 'manual', message: errorMessage });
      }
      else {
        toast.error(errorMessage);
      }
    }
  };

  const switchMode = () => {
    setIsLoginMode((prevMode) => !prevMode);
    reset();
    setValue('password', '');
  };

  return (
    <div className="container w-75">
      <ToastContainer />

      {isLoginMode ? (
        <div className="login form active">
          <header>Login</header>

          <form onSubmit={handleSubmit(handleLogin)}>

            <input type="email" placeholder="Enter your email" {...register('email')} className={errors.email ? 'error' : ''} />
            {errors.email && <div className="error">{errors.email.message}</div>}

            <input type="password" placeholder="Enter your password" {...register('password')} className={errors.password ? 'error' : ''} />
            {errors.password && <div className="error">{errors.password.message}</div>}

            <input type="submit" className="button" value="Login" />
          </form>

          <div className="signup">
            <span>
              Don't have an account? <label onClick={switchMode}>Signup</label>
            </span>
          </div>
        </div>
      ) : (
        <div className="registration form active">
          <header>Signup</header>

          <form onSubmit={handleSubmit(handleSignup)}>

            <input type="text" placeholder="Enter your username" {...register('username')} className={errors.username ? 'error' : ''} />
            {errors.username && <div className="error">{errors.username.message}</div>}

            <input type="email" placeholder="Enter your email" {...register('email')} className={errors.email ? 'error' : ''} />
            {errors.email && <div className="error">{errors.email.message}</div>}

            <input type="password" placeholder="Create a password" {...register('password')} className={errors.password ? 'error' : ''} />
            {errors.password && <div className="error">{errors.password.message}</div>}

            <select {...register('role')} className={errors.role ? 'error' : ''}>
              <option>Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <div className="error">{errors.role.message}</div>}

            <input type="submit" className="button" value="Signup" />
          </form>

          <div className="signup">
            <span>
              Already have an account? <label onClick={switchMode}>Login</label>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(LoginSignup);
