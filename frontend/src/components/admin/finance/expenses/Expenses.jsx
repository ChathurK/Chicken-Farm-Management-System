import React, { useState } from 'react';
import DashboardLayout from '../../DashboardLayout';
import { CurrencyCircleDollar, ChartLineDown, CaretDown, DotsThreeVertical } from '@phosphor-icons/react';

const Expenses = () => {
  // Sample expenses data
  const [transactions, setTransactions] = useState([
    { id: 'EXP-1001', date: '2025-05-07', description: 'Feed Purchase', amount: 450.00, category: 'Feed', payment: 'Bank Transfer' },
    { id: 'EXP-1002', date: '2025-05-05', description: 'Medication Supplies', amount: 320.00, category: 'Medication', payment: 'Credit Card' },
    { id: 'EXP-1003', date: '2025-05-04', description: 'Electricity Bill', amount: 180.00, category: 'Utilities', payment: 'Direct Debit' },
    { id: 'EXP-1004', date: '2025-05-03', description: 'Staff Salaries', amount: 1200.00, category: 'Salary', payment: 'Bank Transfer' },
    { id: 'EXP-1005', date: '2025-05-01', description: 'Equipment Maintenance', amount: 250.00, category: 'Maintenance', payment: 'Cash' },
  ]);
  
  const totalExpenses = transactions.reduce((total, transaction) => total + transaction.amount, 0);
  
  // Filter options
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Filter transactions based on category
  const filteredTransactions = filterCategory === 'All' 
    ? transactions 
    : transactions.filter(transaction => transaction.category === filterCategory);

  // Get unique categories
  const categories = ['All', ...new Set(transactions.map(transaction => transaction.category))];

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <CurrencyCircleDollar size={20} weight="duotone" />
            Add Expense
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-red-800 font-medium">Total Expenses</p>
                <h3 className="text-2xl font-bold text-red-700">${totalExpenses.toFixed(2)}</h3>
                <p className="text-xs text-red-600 mt-1">Current Month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <CurrencyCircleDollar size={24} weight="duotone" className="text-red-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">Monthly Trend</p>
                <h3 className="text-2xl font-bold text-blue-700">-8.3%</h3>
                <p className="text-xs text-blue-600 mt-1">Compared to last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ChartLineDown size={24} weight="duotone" className="text-blue-700" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter */}
        <div className="flex justify-end mb-6">
          <div className="w-48">
            <div className="relative">
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 appearance-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CaretDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Payment Method</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{transaction.id}</td>
                  <td className="px-6 py-4">{transaction.date}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="px-6 py-4">{transaction.category}</td>
                  <td className="px-6 py-4">{transaction.payment}</td>
                  <td className="px-6 py-4 text-red-600 font-medium">-${transaction.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-500 hover:text-gray-700">
                      <DotsThreeVertical size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No expense transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expenses;