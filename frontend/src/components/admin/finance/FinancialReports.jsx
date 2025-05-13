import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarBlank, FilePdf, FileXls, Printer, ArrowDown, ArrowUp, DotsThree, ChartLine, ChartPie, ChartBar, Download } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LineChart = ({ data, labels, title }) => {
  return (
    <div className="h-64 w-full rounded-lg border border-gray-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expense" 
            stroke="#ef4444"
            strokeWidth={2}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

const BarChart = ({ data, labels, title }) => {
  // Prepare data for bar chart if it's not in the right format
  const chartData = Array.isArray(data) && typeof data[0] !== 'object' 
    ? labels.map((label, idx) => ({ 
        name: label, 
        profit: data[idx] 
      }))
    : data;
    
  return (
    <div className="h-64 w-full rounded-lg border border-gray-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={Array.isArray(data) && typeof data[0] !== 'object' ? "name" : "month"} />
          <YAxis />
          <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value)} />
          <Legend />
          <Bar 
            dataKey={Array.isArray(data) && typeof data[0] !== 'object' ? "profit" : "income"} 
            name="Income" 
            fill="#10b981" 
          />
          {Array.isArray(data) && typeof data[0] === 'object' && data[0].expense !== undefined && (
            <Bar dataKey="expense" name="Expense" fill="#ef4444" />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const PieChart = ({ data, labels, title }) => {
  // Sample data for the pie chart categories
  const demoData = title.includes('Income') 
    ? [
        { name: 'Egg Sales', value: 65 },
        { name: 'Chicken Sales', value: 25 },
        { name: 'Other', value: 10 },
      ]
    : [
        { name: 'Feed', value: 40 },
        { name: 'Maintenance', value: 20 },
        { name: 'Salaries', value: 30 },
        { name: 'Utilities', value: 10 },
      ];
      
  // Use the provided data if it exists and is in the right format
  const chartData = Array.isArray(data) && data.length > 0 && data[0].value ? data : demoData;
  
  return (
    <div className="h-64 w-full rounded-lg border border-gray-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
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
    incomeCategories: [], // For pie charts
    expenseCategories: [], // For pie charts
  });

  // References for the report container
  const reportRef = useRef(null);

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
        const transactions = response.data;        // Calculate totals
        let incomeTotal = 0;
        let expenseTotal = 0;
        
        // For category distributions
        const incomeByCategory = {};
        const expenseByCategory = {};

        transactions.forEach((transaction) => {
          if (transaction.transaction_type === 'Income') {
            incomeTotal += parseFloat(transaction.amount);
            
            // Aggregate by category
            const category = transaction.category || 'Other';
            incomeByCategory[category] = (incomeByCategory[category] || 0) + parseFloat(transaction.amount);
          } else if (transaction.transaction_type === 'Expense') {
            expenseTotal += parseFloat(transaction.amount);
            
            // Aggregate by category
            const category = transaction.category || 'Other';
            expenseByCategory[category] = (expenseByCategory[category] || 0) + parseFloat(transaction.amount);
          }
        });

        const netProfit = incomeTotal - expenseTotal;

        // Convert category data to array format for charts
        const incomeCategories = Object.keys(incomeByCategory).map(category => ({
          name: category,
          value: Math.round((incomeByCategory[category] / incomeTotal) * 100) // As percentage
        }));

        const expenseCategories = Object.keys(expenseByCategory).map(category => ({
          name: category,
          value: Math.round((expenseByCategory[category] / expenseTotal) * 100) // As percentage
        }));

        // Get most recent transactions (limited to 5)
        const recentTransactions = transactions
          .sort(
            (a, b) =>
              new Date(b.transaction_date) - new Date(a.transaction_date)
          )
          .slice(0, 5);        // Prepare monthly data for charts
        // Group transactions by month
        const monthlyIncomeExpense = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        transactions.forEach(transaction => {
          const date = new Date(transaction.transaction_date);
          const monthKey = date.getMonth(); // 0-11
          const monthName = months[monthKey];
          
          if (!monthlyIncomeExpense[monthName]) {
            monthlyIncomeExpense[monthName] = {
              month: monthName,
              income: 0,
              expense: 0
            };
          }
          
          if (transaction.transaction_type === 'Income') {
            monthlyIncomeExpense[monthName].income += parseFloat(transaction.amount);
          } else if (transaction.transaction_type === 'Expense') {
            monthlyIncomeExpense[monthName].expense += parseFloat(transaction.amount);
          }
        });
        
        // Convert the monthly data to sorted array
        const monthlyData = Object.values(monthlyIncomeExpense).sort((a, b) => {
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
        
        // Fill in missing months with zero values (if there's data for some months)
        if (monthlyData.length > 0) {
          const existingMonths = monthlyData.map(item => item.month);
          months.forEach(month => {
            if (!existingMonths.includes(month)) {
              monthlyData.push({ month, income: 0, expense: 0 });
            }
          });
          
          // Sort again after adding missing months
          monthlyData.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
        }
        
        // If no real data is available, use the placeholder data
        if (monthlyData.length === 0) {
          // Fallback sample data
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
            incomeCategories,
            expenseCategories,
          });
        } else {
          setFinancialData({
            incomeTotal,
            expenseTotal,
            netProfit,
            recentTransactions,
            monthlyData,
            incomeCategories,
            expenseCategories,
          });
        }

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

  // Export to PDF
  const exportToPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title
    doc.setFontSize(18);
    doc.text('Financial Report', pageWidth / 2, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 
      pageWidth / 2, 
      25, 
      { align: 'center' }
    );
    
    // Add summary data
    doc.setFontSize(14);
    doc.text('Financial Summary', 14, 40);
    
    doc.setFontSize(12);
    doc.text(`Total Income: ${formatCurrency(financialData.incomeTotal)}`, 14, 50);
    doc.text(`Total Expenses: ${formatCurrency(financialData.expenseTotal)}`, 14, 57);
    doc.text(`Net Profit: ${formatCurrency(financialData.netProfit)}`, 14, 64);
    
    // Add transactions table
    doc.setFontSize(14);
    doc.text('Recent Transactions', 14, 80);
    
    if (financialData.recentTransactions.length > 0) {
      // Create table data
      const tableColumn = ["Date", "Type", "Description", "Amount"];
      const tableRows = [];
      
      financialData.recentTransactions.forEach(transaction => {
        const transactionData = [
          formatDate(transaction.transaction_date),
          transaction.transaction_type,
          transaction.description || 'N/A',
          formatCurrency(transaction.amount)
        ];
        tableRows.push(transactionData);
      });
      
      // Add table to document
      doc.autoTable({
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [211, 170, 0] }
      });
    } else {
      doc.text('No recent transactions found.', 14, 85);
    }
    
    // Add footer with generation date
    const footer = `Generated on ${new Date().toLocaleDateString()} by Chicken Farm Management System`;
    doc.setFontSize(10);
    doc.text(footer, pageWidth / 2, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`Financial_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Financial Summary Sheet
    const summaryData = [
      ['Financial Report'],
      [`Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`],
      [],
      ['Summary'],
      ['Total Income', financialData.incomeTotal],
      ['Total Expenses', financialData.expenseTotal],
      ['Net Profit', financialData.netProfit]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Recent Transactions Sheet
    if (financialData.recentTransactions.length > 0) {
      const transactionsData = [
        ['Date', 'Type', 'Description', 'Amount']
      ];
      
      financialData.recentTransactions.forEach(transaction => {
        transactionsData.push([
          formatDate(transaction.transaction_date),
          transaction.transaction_type,
          transaction.description || 'N/A',
          transaction.amount
        ]);
      });
      
      const transactionsWs = XLSX.utils.aoa_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, transactionsWs, 'Recent Transactions');
    }
    
    // Monthly Data Sheet
    if (financialData.monthlyData.length > 0) {
      const monthlyData = [
        ['Month', 'Income', 'Expense', 'Profit']
      ];
      
      financialData.monthlyData.forEach(data => {
        monthlyData.push([
          data.month,
          data.income,
          data.expense,
          data.income - data.expense
        ]);
      });
      
      const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Data');
    }
    
    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Convert to blob and save
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    saveAs(blob, `Financial_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  // Print functionality
  const handlePrint = () => {
    // First, make a screenshot using html2canvas
    if (reportRef.current) {
      html2canvas(reportRef.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295;  // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add subsequent pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Print the PDF
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
  };

  return (    <DashboardLayout>
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
        <div ref={reportRef}>
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
                  data={financialData.monthlyData}
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
                <PieChart 
                  data={financialData.incomeCategories} 
                  title="Income by Category" 
                />
              </div>

              {/* Expense Distribution Pie Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">
                  Expense Distribution
                </h3>
                <PieChart 
                  data={financialData.expenseCategories}
                  title="Expenses by Category" 
                />
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
                              transaction.transaction_type === 'Income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.transaction_type === 'Income' ? (
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
                              transaction.transaction_type === 'Income'
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
              onClick={handlePrint}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={exportToPdf}
            >
              <FilePdf size={16} />
              PDF
            </button>
            <button
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={exportToExcel}
            >
              <FileXls size={16} />
              Excel
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FinancialReports;
