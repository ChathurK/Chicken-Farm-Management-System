import React, { useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash, EnvelopeSimple, Phone } from '@phosphor-icons/react';

const Employees = () => {
  // Sample employees data
  const [employees, setEmployees] = useState([
    { id: 1, firstName: 'John', lastName: 'Doe', position: 'Farm Manager', email: 'john.doe@chickenfarm.com', phone: '123-456-7890', status: 'Active' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', position: 'Feed Specialist', email: 'jane.smith@chickenfarm.com', phone: '234-567-8901', status: 'Active' },
    { id: 3, firstName: 'Mark', lastName: 'Johnson', position: 'Veterinary Assistant', email: 'mark.johnson@chickenfarm.com', phone: '345-678-9012', status: 'On Leave' },
    { id: 4, firstName: 'Sarah', lastName: 'Williams', position: 'Inventory Clerk', email: 'sarah.williams@chickenfarm.com', phone: '456-789-0123', status: 'Active' },
    { id: 5, firstName: 'Michael', lastName: 'Brown', position: 'Farm Worker', email: 'michael.brown@chickenfarm.com', phone: '567-890-1234', status: 'Inactive' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Filter employees based on search term and status
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || employee.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Employees</h1>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} weight="bold" />
            Add Employee
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
              placeholder="Search by name, position, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Employees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-gray-600">{employee.position}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center text-sm">
                  <EnvelopeSimple size={16} className="text-gray-400 mr-2" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <span>{employee.phone}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                <button className="text-blue-500 hover:text-blue-700 p-1">
                  <Pencil size={18} weight="duotone" />
                </button>
                <button className="text-red-500 hover:text-red-700 p-1">
                  <Trash size={18} weight="duotone" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No employees found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;