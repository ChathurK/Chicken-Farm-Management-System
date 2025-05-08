import React, { useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash } from '@phosphor-icons/react';

const Buyers = () => {
  // Sample buyers data
  const [buyers, setBuyers] = useState([
    { id: 1, name: 'City Supermarket', contact: 'John Smith', phone: '123-456-7890', email: 'john@citysupermarket.com', type: 'Retail' },
    { id: 2, name: 'Fresh Foods Inc', contact: 'Sarah Johnson', phone: '234-567-8901', email: 'sarah@freshfoods.com', type: 'Wholesale' },
    { id: 3, name: 'Local Restaurant', contact: 'Michael Lee', phone: '345-678-9012', email: 'michael@localrestaurant.com', type: 'Restaurant' },
    { id: 4, name: 'Farm Direct', contact: 'Emily Davis', phone: '456-789-0123', email: 'emily@farmdirect.com', type: 'Distributor' },
    { id: 5, name: 'Organic Market', contact: 'David Wilson', phone: '567-890-1234', email: 'david@organicmarket.com', type: 'Retail' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter buyers based on search term
  const filteredBuyers = buyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Buyers</h1>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} weight="bold" />
            Add New Buyer
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
              placeholder="Search buyers by name, contact, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Buyers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Buyer Name</th>
                <th scope="col" className="px-6 py-3">Contact Person</th>
                <th scope="col" className="px-6 py-3">Phone</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{buyer.name}</td>
                  <td className="px-6 py-4">{buyer.contact}</td>
                  <td className="px-6 py-4">{buyer.phone}</td>
                  <td className="px-6 py-4">{buyer.email}</td>
                  <td className="px-6 py-4">{buyer.type}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash size={20} weight="duotone" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBuyers.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No buyers found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Buyers;