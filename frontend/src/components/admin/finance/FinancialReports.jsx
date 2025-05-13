import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarBlank,
  FilePdf,
  FileXls,
  Printer,
  ArrowDown,
  ArrowUp,
  DotsThree,
  ChartLine,
  ChartPie,
  ChartBar,
  Download,
} from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

// Import chart components
// For a real implementation, you would need to install a charting library like Chart.js or Recharts
// Here I'll create placeholder components that you can replace with actual charts

const LineChart = ({ data, labels, title }) => {
  // Placeholder for line chart component
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <ChartLine size={48} weight="thin" className="mb-2 text-gray-400" />
      <p className="text-center text-sm text-gray-500">
        {title || 'Line Chart'}
        <br />
        <span className="text-xs">
          (Implement with your preferred chart library)
        </span>
      </p>
    </div>
  );
};

const BarChart = ({ data, labels, title }) => {
  // Placeholder for bar chart component
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <ChartBar size={48} weight="thin" className="mb-2 text-gray-400" />
      <p className="text-center text-sm text-gray-500">
        {title || 'Bar Chart'}
        <br />
        <span className="text-xs">
          (Implement with your preferred chart library)
        </span>
      </p>
    </div>
  );
};

const PieChart = ({ data, labels, title }) => {
  // Placeholder for pie chart component
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <ChartPie size={48} weight="thin" className="mb-2 text-gray-400" />
      <p className="text-center text-sm text-gray-500">
        {title || 'Pie Chart'}
        <br />
        <span className="text-xs">
          (Implement with your preferred chart library)
        </span>
      </p>
    </div>
  );
};

const FinancialReports = () => {
  const navigate = useNavigate();

  // State for financial data
  const [financialData, setFinancialData] = useState({
    incomeTotal: 0,
    expenseTotal: 0,
    netProfit: 0,
    recentTransactions: [],
    monthlyData: [], // For charts
  });

  // State for date range filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);

        // Fetch transactions within the date range
        const queryParams = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        const response = await api.get(`/api/transactions?${queryParams}`);
        const transactions = response.data;

        // Calculate totals
        let incomeTotal = 0;
        let expenseTotal = 0;

        transactions.forEach((transaction) => {
          if (transaction.transaction_type === 'income') {
            incomeTotal += parseFloat(transaction.amount);
          } else if (transaction.transaction_type === 'expense') {
            expenseTotal += parseFloat(transaction.amount);
          }
        });

        const netProfit = incomeTotal - expenseTotal;

        // Get most recent transactions (limited to 5)
        const recentTransactions = transactions
          .sort(
            (a, b) =>
              new Date(b.transaction_date) - new Date(a.transaction_date)
          )
          .slice(0, 5);

        // Prepare monthly data for charts (placeholder data for now)
        // In a real implementation, you would aggregate the data by month
        const monthlyData = [
          { month: 'Jan', income: 5000, expense: 3000 },
          { month: 'Feb', income: 6000, expense: 3500 },
          { month: 'Mar', income: 7500, expense: 4000 },
          { month: 'Apr', income: 8000, expense: 4200 },
          { month: 'May', income: 9000, expense: 4800 },
          { month: 'Jun', income: 10000, expense: 5000 },
        ];

        setFinancialData({
          incomeTotal,
          expenseTotal,
          netProfit,
          recentTransactions,
          monthlyData,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load financial data. Please try again.');
        setLoading(false);
        console.error('Error fetching financial data:', err);
      }
    };

    fetchFinancialData();
  }, [dateRange]);

  // Handlers for date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Financial Reports</h1>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">From:</span>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">To:</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Income Card */}
            <div className="rounded-lg bg-green-50 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-700">
                  Total Income
                </h2>
                <ArrowUp
                  size={24}
                  weight="duotone"
                  className="text-green-600"
                />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(financialData.incomeTotal)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(dateRange.startDate)} -{' '}
                {formatDate(dateRange.endDate)}
              </p>
            </div>

            {/* Expense Card */}
            <div className="rounded-lg bg-red-50 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-700">
                  Total Expenses
                </h2>
                <ArrowDown
                  size={24}
                  weight="duotone"
                  className="text-red-600"
                />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(financialData.expenseTotal)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(dateRange.startDate)} -{' '}
                {formatDate(dateRange.endDate)}
              </p>
            </div>

            {/* Net Profit Card */}
            <div className="rounded-lg bg-amber-50 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-700">
                  Net Profit
                </h2>
                {financialData.netProfit >= 0 ? (
                  <ArrowUp
                    size={24}
                    weight="duotone"
                    className="text-amber-600"
                  />
                ) : (
                  <ArrowDown
                    size={24}
                    weight="duotone"
                    className="text-amber-600"
                  />
                )}
              </div>
              <p
                className={`text-3xl font-bold ${
                  financialData.netProfit >= 0
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(financialData.netProfit)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(dateRange.startDate)} -{' '}
                {formatDate(dateRange.endDate)}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-700">
              Financial Overview
            </h2>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Income vs Expenses Line Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Income vs Expenses
                </h3>
                <LineChart
                  data={financialData.monthlyData}
                  labels={financialData.monthlyData.map((d) => d.month)}
                  title="Monthly Income vs Expenses"
                />
              </div>

              {/* Monthly Profit Bar Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Monthly Profit
                </h3>
                <BarChart
                  data={financialData.monthlyData.map(
                    (d) => d.income - d.expense
                  )}
                  labels={financialData.monthlyData.map((d) => d.month)}
                  title="Monthly Profit Analysis"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Income Distribution Pie Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Income Distribution
                </h3>
                <PieChart title="Income by Category" />
              </div>

              {/* Expense Distribution Pie Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Expense Distribution
                </h3>
                <PieChart title="Expenses by Category" />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-700">
                Recent Transactions
              </h2>
              <button
                onClick={() => navigate('/admin/finance/transactions')}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                View All
              </button>
            </div>

            {financialData.recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500">
                No recent transactions found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {financialData.recentTransactions.map((transaction) => (
                      <tr
                        key={transaction.transaction_id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          navigate(
                            `/admin/finance/transactions/${transaction.transaction_id}`
                          )
                        }
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transaction.transaction_type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.transaction_type === 'income' ? (
                              <ArrowUp size={12} className="mr-1" />
                            ) : (
                              <ArrowDown size={12} className="mr-1" />
                            )}
                            {transaction.transaction_type
                              .charAt(0)
                              .toUpperCase() +
                              transaction.transaction_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.description || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <span
                            className={
                              transaction.transaction_type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/finance/transactions/${transaction.transaction_id}`
                              );
                            }}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <DotsThree size={24} weight="bold" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() =>
                console.log('Print functionality to be implemented')
              }
            >
              <Printer size={16} />
              Print
            </button>
            <button
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() =>
                console.log('PDF export functionality to be implemented')
              }
            >
              <FilePdf size={16} />
              PDF
            </button>
            <button
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() =>
                console.log('Excel export functionality to be implemented')
              }
            >
              <FileXls size={16} />
              Excel
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default FinancialReports;
