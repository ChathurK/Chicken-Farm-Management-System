import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 ${
              activeTab === 'profile'
                ? 'border-b-2 border-amber-600 text-amber-600 font-medium'
                : 'text-gray-600 hover:text-amber-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'security'
                ? 'border-b-2 border-amber-600 text-amber-600 font-medium'
                : 'text-gray-600 hover:text-amber-600'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>
        
        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'profile' ? (
            <ProfileForm user={user} />
          ) : (
            <PasswordForm userId={user.user_id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;