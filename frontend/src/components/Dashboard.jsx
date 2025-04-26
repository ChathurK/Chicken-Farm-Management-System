import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-50 p-4 mb-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Welcome, {user?.full_name}</h2>
            <p className="text-gray-700">Role: {user?.role}</p>
            <p className="text-gray-700">Email: {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-amber-800 mb-2">Today's Tasks</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Check chicken health status</li>
                <li>Collect and record egg production</li>
                <li>Ensure feed and water supplies</li>
                <li>Clean the chicken coops</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-800 mb-2">Recent Updates</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>New order received from Martha Restaurant</li>
                <li>Feed inventory updated</li>
                <li>25 new chicks hatched yesterday</li>
                <li>Vaccination scheduled for next week</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;