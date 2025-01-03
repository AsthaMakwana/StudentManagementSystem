// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {

//     const token = localStorage.getItem('authToken');

//     if (!token) {
//         return <Navigate to="/login"/>;
//     }
//     return children;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;

