import LandingPage from './components/landing/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/admin/Dashboard';
import EmployeeDashboard from './components/employee/Dashboard';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/profile/Profile';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  // Protected routes for admin users
  {
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> }
    ],
  },
  // Protected routes for employee users
  {
    element: <ProtectedRoute requireEmployee={true} />,
    children: [
      { path: '/employee/dashboard', element: <EmployeeDashboard /> }
    ],
  },
  // Protected routes for any authenticated user
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profile', element: <Profile /> }
    ],
  },
  { path: '*', element: <NotFound /> },
];

export default routes;