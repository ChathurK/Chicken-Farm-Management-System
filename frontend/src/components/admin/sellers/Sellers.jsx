import React, { useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash } from '@phosphor-icons/react';

const Sellers = () => {
  // Sample sellers data
  const [sellers, setSellers] = useState([
    { id: 1, name: 'Farm Supply Co', contact: 'Robert Johnson', phone: '123-456-7890', email: 'robert@farmsupply.com', type: 'Feed Supplier' },
    { id: 2, name: 'Poultry Supplies Ltd', contact: 'Jennifer Williams', phone: '234-567-8901', email: 'jennifer@poultrysupplies.com', type: 'Equipment' },
    { id: 3, name: 'Egg Crate Manufacturers', contact: 'David Brown', phone: '345-678-9012', email: 'david@eggcrates.com', type: 'Packaging' },
    { id: 4, name: 'MediVet Supplies', contact: 'Lisa Garcia', phone: '456-789-0123', email: 'lisa@medivet.com', type: 'Medication' },
    { id: 5, name: 'Organic Feed Inc', contact: 'Thomas Moore', phone: '567-890-1234', email: 'thomas@organicfeed.com', type: 'Feed Supplier' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter sellers based on search term
  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sellers</h1>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} weight="bold" />
            Add New Seller
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
              placeholder="Search sellers by name, contact, or type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Sellers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Seller Name</th>
                <th scope="col" className="px-6 py-3">Contact Person</th>
                <th scope="col" className="px-6 py-3">Phone</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{seller.name}</td>
                  <td className="px-6 py-4">{seller.contact}</td>
                  <td className="px-6 py-4">{seller.phone}</td>
                  <td className="px-6 py-4">{seller.email}</td>
                  <td className="px-6 py-4">{seller.type}</td>
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
        
        {filteredSellers.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No sellers found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sellers;