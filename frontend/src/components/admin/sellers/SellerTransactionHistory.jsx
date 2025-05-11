import React, { useState, useEffect } from 'react';
import { ClockCounterClockwise, Package, Coins, ArrowUp, ArrowDown, PiggyBank } from '@phosphor-icons/react';
import api from '../../../utils/api';

const SellerTransactionHistory = ({ sellerId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sellers/${sellerId}/transactions`);
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load transaction history. Please try again.');
        setLoading(false);
        console.error('Error fetching transactions:', err);
      }
    };

    if (sellerId) {
      fetchTransactions();
    }
  }, [sellerId]);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    if (type === 'Expense') {
      return <ArrowUp size={20} className="text-red-500" />;
    } else {
      return <ArrowDown size={20} className="text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-6 text-center">
        <PiggyBank
          size={48}
          weight="duotone"
          className="mx-auto mb-2 text-gray-400"
        />
        <p className="text-gray-500">
          No transaction history found for this seller.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="mb-4 flex items-center gap-2 text-gray-700">
        <ClockCounterClockwise size={20} weight="duotone" />
        <h3 className="text-lg font-semibold">Transaction History</h3>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Item</th>
              <th scope="col" className="px-4 py-3">Amount</th>
              <th scope="col" className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.transaction_id}
                className="border-b bg-white hover:bg-gray-50"
              >
                <td className="p-4">
                  {formatDate(transaction.transaction_date)}
                </td>
                <td className="flex items-center gap-1 p-4">
                  {getTransactionIcon(transaction.transaction_type)}
                  <span
                    className={
                      transaction.transaction_type === 'Expense'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {transaction.transaction_type}
                  </span>
                </td>
                <td className="p-4">{transaction.category}</td>
                <td className="p-4">{transaction.item_name || '-'}</td>
                <td className="p-4 font-medium">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="p-4">{transaction.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerTransactionHistory;
