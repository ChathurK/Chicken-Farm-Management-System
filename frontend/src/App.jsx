import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ScreenSizeIndicator from './components/ScreenSizeIndicator';
import routes from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';

// AuthCheck component to handle role-based redirects after login
const AuthCheck = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'Admin') {
        navigate('/admindashboard');
      } else {
        navigate('/employeedashboard');
      }
    }
  }, [user, loading, navigate]);

  return children;
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AuthCheck>
          <Routes>
            {routes.map((route, index) => {
              // Handle nested routes
              if (route.children) {
                return (
                  <Route key={index} element={route.element}>
                    {route.children.map((childRoute, childIndex) => (
                      <Route 
                        key={`${index}-${childIndex}`} 
                        path={childRoute.path} 
                        element={childRoute.element} 
                      />
                    ))}
                  </Route>
                );
              }
              
              // Regular route
              return (
                <Route key={index} path={route.path} element={route.element} />
              );
            })}
          </Routes>
          <ScreenSizeIndicator />
        </AuthCheck>
      </AuthProvider>
    </Router>
  );
};

export default App;