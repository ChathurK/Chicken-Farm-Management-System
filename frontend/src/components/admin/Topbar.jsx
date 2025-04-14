import React from 'react';
import { Bell, UserCircle } from '@phosphor-icons/react';

const Topbar = () => {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search..."
        className="w-1/2 p-2 border rounded-lg"
      />
      <div className="flex items-center gap-4">
        <Bell size={24} weight='duotone' className="text-amber-600" />
        <UserCircle size={28} weight='duotone' className="text-amber-600" />
      </div>
    </div>
  );
};

export default Topbar;
