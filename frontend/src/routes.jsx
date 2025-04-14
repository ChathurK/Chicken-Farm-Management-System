import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/admin/Dashboard';
import NotFound from './components/NotFound';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/admindashboard', element: <AdminDashboard /> },
  { path: '*', element: <NotFound /> },
];

export default routes;