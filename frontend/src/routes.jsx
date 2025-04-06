import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NotFound from './components/NotFound';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '*', element: <NotFound /> }, // Fallback route for undefined paths
];

export default routes;