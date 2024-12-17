import LoginSignup from './components/client/LoginSignup.jsx'
import Students from './components/client/Students.jsx'
import CreateStudent from './components/admin/CreateStudent.jsx'
import UpdateStudent from './components/admin/UpdateStudent.jsx'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import StudentsDetails from './components/client/StudentsDetails.jsx'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? (
    <>{children}</>
  ) : (
    <Navigate to='/login' />
  );
}

const Layout = () => {
  return (
    <div className='main-layout'>
      <Outlet />
    </div>
  )
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route >
            <Route path="/" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateStudent /></ProtectedRoute>} />
            <Route path="/update/:id" element={<ProtectedRoute><UpdateStudent /></ProtectedRoute>} />
            <Route path="/details/:id" element={<ProtectedRoute><StudentsDetails /></ProtectedRoute>} />
          </Route>
          <Route exact path='/login' element={<LoginSignup />} />
          <Route exact path='*' element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
