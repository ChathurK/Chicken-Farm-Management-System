import LandingPage from './components/landing/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/admin/Dashboard';
import EmployeeDashboard from './components/employee/Dashboard';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/profile/Profile';

// Admin components
import Calendar from './components/admin/calendar/Calendar';
import Orders from './components/admin/orders/Orders';
import Income from './components/admin/finance/income/Income';
import Expenses from './components/admin/finance/expenses/Expenses';
import Buyers from './components/admin/buyers/Buyers';
import BuyerForm from './components/admin/buyers/BuyerForm';
import BuyerDetails from './components/admin/buyers/BuyerDetails';
import Sellers from './components/admin/sellers/Sellers';
import SellerForm from './components/admin/sellers/SellerForm';
import SellerDetails from './components/admin/sellers/SellerDetails';
import Employees from './components/admin/employees/Employees';
import Livestock from './components/admin/livestock/Livestock';
import Inventory from './components/admin/inventory/Inventory';
import InventoryForm from './components/admin/inventory/InventoryForm';
import InventoryDetails from './components/admin/inventory/InventoryDetails';
import InventoryReports from './components/admin/inventory/reports/InventoryReports';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  // Protected routes for admin users
  {
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/calendar', element: <Calendar /> },
      { path: '/admin/orders', element: <Orders /> },
      { path: '/admin/finance/income', element: <Income /> },
      { path: '/admin/finance/expenses', element: <Expenses /> },
      { path: '/admin/buyers', element: <Buyers /> },
      { path: '/admin/buyers/add', element: <BuyerForm /> },
      { path: '/admin/buyers/edit/:id', element: <BuyerForm /> },
      { path: '/admin/buyers/:id', element: <BuyerDetails /> },
      { path: '/admin/sellers', element: <Sellers /> },
      { path: '/admin/sellers/add', element: <SellerForm /> },
      { path: '/admin/sellers/edit/:id', element: <SellerForm /> },
      { path: '/admin/sellers/:id', element: <SellerDetails /> },
      { path: '/admin/employees', element: <Employees /> },
      { path: '/admin/livestock/eggs', element: <Livestock /> },
      { path: '/admin/livestock/chicks', element: <Livestock /> },
      { path: '/admin/livestock/chickens', element: <Livestock /> },
      { path: '/admin/inventory/feed', element: <Inventory /> },
      { path: '/admin/inventory/medications', element: <Inventory /> },
      { path: '/admin/inventory/other', element: <Inventory /> },
      { path: '/admin/inventory/reports', element: <InventoryReports /> },
      { path: '/admin/inventory/add/:category', element: <InventoryForm /> },
      { path: '/admin/inventory/edit/:id', element: <InventoryForm /> },
      { path: '/admin/inventory/:id', element: <InventoryDetails /> },
    ],
  },
  // Protected routes for employee users
  {
    element: <ProtectedRoute requireEmployee={true} />,
    children: [{ path: '/employee/dashboard', element: <EmployeeDashboard /> }],
  },
  // Protected routes for any authenticated user
  {
    element: <ProtectedRoute />,
    children: [{ path: '/profile', element: <Profile /> }],
  },
  { path: '*', element: <NotFound /> },
];

export default routes;
