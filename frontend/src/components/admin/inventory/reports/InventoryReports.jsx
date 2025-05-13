import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCsv,
  Printer,
  Table,
  CalendarCheck,
  ArrowLeft,
  Export,
  ChartLine,
} from '@phosphor-icons/react';
import InventoryAPI from '../../../../utils/InventoryAPI';
import InventoryModal from '../InventoryModal';

const InventoryReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [category, setCategory] = useState('');

  // Handle report generation
  const generateReport = async () => {
    try {
      setLoading(true);

      let filters = {};

      // Add filters based on report type
      if (reportType === 'category' && category) {
        filters.category = category;
      }

      if (reportType === 'lowStock') {
        filters.lowStock = true;
      }

      if (reportType === 'expiring') {
        filters.expiringSoon = true;
      }

      if (reportType === 'date' && dateRange.startDate && dateRange.endDate) {
        filters.startDate = dateRange.startDate;
        filters.endDate = dateRange.endDate;
      }

      // In a real implementation, this would generate a report
      // For now, we'll simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Normally, we would use the API to generate and download the report
      const response = await InventoryAPI.generateReport(filters);

      setLoading(false);
      setShowReportModal(false);

      // Show success message or download file
      alert(
        'Report generated successfully! In a real implementation, this would download a CSV or PDF file.'
      );
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      setLoading(false);
      console.error('Error generating report:', err);
    }
  };

  // Report type options
  const reportTypes = [
    {
      id: 'all',
      label: 'All Inventory Items',
      icon: <Table size={20} weight="duotone" className="text-blue-500" />,
    },
    {
      id: 'category',
      label: 'By Category',
      icon: <FileCsv size={20} weight="duotone" className="text-green-500" />,
    },
    {
      id: 'lowStock',
      label: 'Low Stock Items',
      icon: (
        <ChartLine size={20} weight="duotone" className="text-yellow-500" />
      ),
    },
    {
      id: 'expiring',
      label: 'Expiring Items',
      icon: (
        <CalendarCheck size={20} weight="duotone" className="text-red-500" />
      ),
    },
    {
      id: 'date',
      label: 'By Date Range',
      icon: (
        <CalendarCheck size={20} weight="duotone" className="text-purple-500" />
      ),
    },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">Inventory Reports</h1>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Report options */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-full">
          <h2 className="mb-3 text-lg font-semibold">
            Generate Inventory Reports
          </h2>
          <p className="mb-4 text-gray-600">
            Generate and download reports for your inventory. Choose from the
            options below.
          </p>
        </div>

        {reportTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => {
              setReportType(type.id);
              setShowReportModal(true);
            }}
            className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="mr-4">{type.icon}</div>
            <div>
              <h3 className="font-medium">{type.label}</h3>
              <p className="text-sm text-gray-500">
                {type.id === 'all' &&
                  'Complete inventory list with all details'}
                {type.id === 'category' &&
                  'Inventory items filtered by category'}
                {type.id === 'lowStock' && 'Items with low stock levels'}
                {type.id === 'expiring' && 'Items that will expire soon'}
                {type.id === 'date' &&
                  'Items filtered by purchase or expiration date'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={() => {
            setReportType('all');
            setShowReportModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          <Printer size={20} weight="duotone" />
          Print Inventory
        </button>
        <button
          onClick={() => {
            setReportType('all');
            generateReport();
          }}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          <Export size={20} weight="duotone" />
          Export to CSV
        </button>
      </div>

      {/* Report Configuration Modal */}
      <InventoryModal
        isOpen={showReportModal}
        title={`Generate ${
          reportType === 'all'
            ? 'Complete Inventory'
            : reportType === 'category'
              ? 'Category-Based'
              : reportType === 'lowStock'
                ? 'Low Stock'
                : reportType === 'expiring'
                  ? 'Expiring Items'
                  : 'Date Range'
        } Report`}
        onClose={() => setShowReportModal(false)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">Configure your report options below.</p>

          {/* Category selector for category-based report */}
          {reportType === 'category' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Select Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">Select a category</option>
                <option value="Feed">Feed</option>
                <option value="Medication">Medication</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Date range selector for date-based report */}
          {reportType === 'date' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Format options */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Report Format
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  defaultChecked
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">PDF</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">Excel</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generateReport}
              disabled={
                loading ||
                (reportType === 'category' && !category) ||
                (reportType === 'date' &&
                  (!dateRange.startDate || !dateRange.endDate))
              }
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-70"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </InventoryModal>
    </div>
  );
};

export default InventoryReports;
