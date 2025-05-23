import LandingPage from './components/landing/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/admin/Dashboard';
import EmployeeDashboard from './components/employee/Dashboard';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/profile/Profile';

// Employee components
import { default as EmployeeOrders } from './components/employee/orders/Orders'; 
import { default as EmployeeOrderDetails } from './components/employee/orders/OrderDetails';
import { default as EmployeeLivestock } from './components/employee/livestock/Livestock';
import { default as EmployeeInventory } from './components/employee/inventory/Inventory';
import { default as EmployeeInventoryDetails } from './components/employee/inventory/InventoryDetails';
import { default as EmployeeInventoryUpdateForm } from './components/employee/inventory/InventoryUpdateForm';

// Admin components
import Calendar from './components/admin/calendar/Calendar';
import Orders from './components/admin/orders/Orders';
import OrderForm from './components/admin/orders/OrderForm';
import OrderDetails from './components/admin/orders/OrderDetails';
import OrderItemForm from './components/admin/orders/OrderItemForm';
// Finance
import {
  TransactionList,
  TransactionForm,
  TransactionDetails,
  FinancialReports,
} from './components/admin/finance/index';
// Other admin components
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
import { Navigate } from 'react-router-dom';

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
      // Orders routes
      { path: '/admin/orders', element: <Orders /> },
      { path: '/admin/orders/new', element: <OrderForm /> },
      { path: '/admin/orders/edit/:id', element: <OrderForm /> },
      { path: '/admin/orders/:id', element: <OrderDetails /> },
      { path: '/admin/orders/:id/add-item', element: <OrderItemForm /> },
      { path: '/admin/orders/:id/items/:itemId/edit', element: <OrderItemForm /> },
      // Finance routes
      { path: '/admin/finance/transactions', element: <TransactionList /> },
      { path: '/admin/finance/transactions/add', element: <TransactionForm /> },
      { path: '/admin/finance/transactions/edit/:id', element: <TransactionForm /> },
      { path: '/admin/finance/transactions/:id', element: <TransactionDetails /> },
      { path: '/admin/finance/reports', element: <FinancialReports /> },
      // Buyers routes
      { path: '/admin/buyers', element: <Buyers /> },
      { path: '/admin/buyers/add', element: <BuyerForm /> },
      { path: '/admin/buyers/edit/:id', element: <BuyerForm /> },
      { path: '/admin/buyers/:id', element: <BuyerDetails /> },
      // Sellers routes
      { path: '/admin/sellers', element: <Sellers /> },
      { path: '/admin/sellers/add', element: <SellerForm /> },
      { path: '/admin/sellers/edit/:id', element: <SellerForm /> },
      { path: '/admin/sellers/:id', element: <SellerDetails /> },
      // Employees routes
      { path: '/admin/employees', element: <Employees /> },
      // Livestock routes
      { path: '/admin/livestock', element: <Navigate to="/admin/livestock/eggs" replace /> },
      { path: '/admin/livestock/:type', element: <Livestock /> },
      // Inventory routes
      { path: '/admin/inventory', element: <Navigate to="/admin/inventory/feed" replace /> },
      { path: '/admin/inventory/reports', element: <InventoryReports /> },
      { path: '/admin/inventory/add/:category', element: <InventoryForm /> },
      { path: '/admin/inventory/edit/:id', element: <InventoryForm /> },
      { path: '/admin/inventory/feed', element: <Inventory /> },
      { path: '/admin/inventory/medication', element: <Inventory /> },
      { path: '/admin/inventory/other', element: <Inventory /> },
      { path: '/admin/inventory/:id', element: <InventoryDetails /> },
    ],
  },

  // Protected routes for employee users
  {
    element: <ProtectedRoute requireEmployee={true} />,
    children: [
      { path: '/employee/dashboard', element: <EmployeeDashboard /> },
      // Employee Order Management routes
      { path: '/employee/orders', element: <EmployeeOrders /> },
      { path: '/employee/orders/:id', element: <EmployeeOrderDetails /> },
      // Employee Livestock routes
      { path: '/employee/livestock', element: <Navigate to="/employee/livestock/eggs" replace /> },
      { path: '/employee/livestock/:type', element: <EmployeeLivestock /> },
      // Employee Inventory routes
      { path: '/employee/inventory', element: <Navigate to="/employee/inventory/feed" replace /> },
      { path: '/employee/inventory/feed', element: <EmployeeInventory /> },
      { path: '/employee/inventory/medication', element: <EmployeeInventory /> },
      { path: '/employee/inventory/other', element: <EmployeeInventory /> },
      { path: '/employee/inventory/view/:id', element: <EmployeeInventoryDetails /> },
      { path: '/employee/inventory/update/:id', element: <EmployeeInventoryUpdateForm /> },
    ],
  },
  // Protected routes for any authenticated user
  {
    element: <ProtectedRoute />,
    children: [{ path: '/profile', element: <Profile /> }],
  },
  { path: '*', element: <NotFound /> },
];

export default routes;
