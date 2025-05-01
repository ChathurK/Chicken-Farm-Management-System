import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserCircle, Moon, Sun, SignOut, User } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  
  // Refs for dropdown containers
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Effect to handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close notification dropdown if click is outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      // Close profile dropdown if click is outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    // Add event listener when dropdowns are open
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  // Demo notifications
  const notifications = [
    { id: 1, message: "New order received", time: "5 min ago" },
    { id: 2, message: "Low inventory alert: Feed", time: "1 hour ago" },
    { id: 3, message: "Daily report generated", time: "3 hours ago" },
    { id: 4, message: "New user registered", time: "1 day ago" },
    { id: 5, message: "System update available", time: "2 days ago" },
    { id: 6, message: "New comment on your post", time: "3 days ago" },
    { id: 7, message: "Password change successful", time: "1 week ago" },
    { id: 8, message: "New feature released", time: "2 weeks ago" },
    { id: 9, message: "Server maintenance scheduled", time: "3 weeks ago" },
    { id: 10, message: "New message from support", time: "1 month ago" },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual dark mode toggle functionality
    // This is just a placeholder for the UI interaction
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-end items-center relative">
      <div className="flex items-center gap-5">
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? 
            <Sun size={24} weight='duotone' className="text-amber-600" /> : 
            <Moon size={24} weight='duotone' className="text-amber-600" />
          }
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={handleNotificationClick} 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
            aria-label="Notifications"
          >
            <Bell size={24} weight='duotone' className="text-amber-600" />
          </button>
          
          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-200">
              <h3 className="px-4 py-2 text-sm font-semibold border-b">Notifications</h3>
              {notifications.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(notification => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-100 transition-colors duration-300 border-b border-gray-100">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">No notifications</p>
              )}
              <div className="px-4 py-2 text-center border-t">
                <button className="text-sm text-amber-600 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
            aria-label="User menu"
          >
            <UserCircle size={28} weight='duotone' className="text-amber-600" />
          </button>
          
          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
              </div>
              <a 
                href="/profile" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
              >
                <User size={16} weight='duotone' />
                My Profile
              </a>
              <button 
                onClick={logout} 
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
              >
                <SignOut size={16} weight='duotone' />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;