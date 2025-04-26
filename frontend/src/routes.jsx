import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  // Protected routes for regular users
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> }
    ],
  },
  // Protected routes for admin users
  {
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      { path: '/admindashboard', element: <AdminDashboard /> }
    ],
  },
  { path: '*', element: <NotFound /> },
];

export default routes;