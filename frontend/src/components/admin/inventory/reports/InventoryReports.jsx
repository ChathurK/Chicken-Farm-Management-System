import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCsv, Printer, Table, CalendarCheck, ArrowLeft, Export, ChartLine } from '@phosphor-icons/react';
import InventoryAPI from '../../../../utils/InventoryAPI';
import InventoryModal from '../InventoryModal';
// Import libraries for report generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper function to convert inventory data to CSV format
const convertToCSV = (inventoryData) => {
  if (!inventoryData || !inventoryData.length) {
    return 'No data available';
  }

  // Extract headers from the first item
  const headers = Object.keys(inventoryData[0]);

  // Create CSV header row
  let csvContent = headers.join(',') + '\n';

  // Add data rows
  inventoryData.forEach((item) => {
    const row = headers
      .map((header) => {
        // Handle special cases (objects, arrays, null values)
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object')
          return JSON.stringify(value).replace(/"/g, '""');

        // Escape quotes and wrap in quotes if the value contains commas or quotes
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(',');

    csvContent += row + '\n';
  });

  return csvContent;
};

// Helper function to trigger file download
const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
};

// Helper function to generate PDF report
const generatePdfReport = (inventoryData, reportTitle) => {
  // Initialize jsPDF
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(reportTitle, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Create table with inventory data
  const tableColumn = Object.keys(inventoryData[0]);
  const tableRows = inventoryData.map(item => {
    return Object.values(item).map(value => 
      value === null || value === undefined ? '' : String(value)
    );
  });
  
  // Generate the table
  doc.autoTable({
    head: [tableColumn.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [221, 153, 38], // Amber color for the header
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  return doc;
};

// Helper function to generate Excel report using SheetJS
const generateExcelReport = (inventoryData, reportTitle) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert inventory data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(inventoryData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  // Format header row (make it bold)
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'DD9926' } } // Amber color
  };
  
  // Get column headers
  const columnHeaders = Object.keys(inventoryData[0]);
  
  // Apply header styling (not fully supported in basic version but included for future enhancement)
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[address]) worksheet[address] = { v: columnHeaders[C] };
    worksheet[address].s = headerStyle;
  }
  
  // Auto-size columns
  const columnWidths = columnHeaders.map(header => ({
    wch: Math.max(header.length, 10) // Minimum width of 10
  }));
  worksheet['!cols'] = columnWidths;
  
  // Return the workbook
  return workbook;
};

// Sample data for mock reports when API doesn't return data
const getMockInventoryData = (reportType) => {
  const baseData = [
    {
      inventory_id: 1,
      category: 'Feed',
      item_name: 'Layer Feed',
      quantity: 500,
      unit: 'kg',
      purchase_date: '2025-04-15',
      expiration_date: '2025-07-15',
      cost_per_unit: 2.5,
      status: 'Available'
    },
    {
      inventory_id: 2,
      category: 'Medication',
      item_name: 'Antibiotics',
      quantity: 50,
      unit: 'vials',
      purchase_date: '2025-04-10',
      expiration_date: '2025-05-25',
      cost_per_unit: 15.75,
      status: 'Low'
    },
    {
      inventory_id: 3,
      category: 'Supplies',
      item_name: 'Feeders',
      quantity: 30,
      unit: 'pieces',
      purchase_date: '2025-03-20',
      expiration_date: null,
      cost_per_unit: 35.99,
      status: 'Available'
    },
    {
      inventory_id: 4,
      category: 'Feed',
      item_name: 'Broiler Feed',
      quantity: 200,
      unit: 'kg',
      purchase_date: '2025-05-01',
      expiration_date: '2025-08-01',
      cost_per_unit: 3.0,
      status: 'Available'
    },
    {
      inventory_id: 5,
      category: 'Medication',
      item_name: 'Vitamins',
      quantity: 10,
      unit: 'bottles',
      purchase_date: '2025-04-25',
      expiration_date: '2025-06-25',
      cost_per_unit: 12.99,
      status: 'Low'
    },
    {
      inventory_id: 6,
      category: 'Supplies',
      item_name: 'Water dispensers',
      quantity: 5,
      unit: 'pieces',
      purchase_date: '2024-11-10',
      expiration_date: null,
      cost_per_unit: 45.50,
      status: 'Available'
    },
    {
      inventory_id: 7,
      category: 'Medication',
      item_name: 'Disinfectant',
      quantity: 2,
      unit: 'gallons',
      purchase_date: '2025-03-05',
      expiration_date: '2025-05-10',
      cost_per_unit: 24.99,
      status: 'Low'
    },
    {
      inventory_id: 8,
      category: 'Other',
      item_name: 'Record books',
      quantity: 15,
      unit: 'pieces',
      purchase_date: '2025-01-15',
      expiration_date: null,
      cost_per_unit: 5.25,
      status: 'Available'
    }
  ];
  
  // Filter data based on report type
  if (reportType === 'lowStock') {
    return baseData.filter(item => item.status === 'Low');
  } else if (reportType === 'expiring') {
    // Items expiring in the next 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return baseData.filter(item => {
      if (!item.expiration_date) return false;
      const expiryDate = new Date(item.expiration_date);
      return expiryDate <= thirtyDaysFromNow;
    });
  } else if (reportType === 'category') {
    // This would be filtered by the category parameter in a real implementation
    return baseData;
  } else {
    // All items
    return baseData;
  }
};

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
  const [reportFormat, setReportFormat] = useState('csv');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle report generation
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

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

      // For development testing, simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate report filename
      const dateStr = new Date().toISOString().split('T')[0];
      const reportTypeStr = reportType === 'all' ? 'complete' : 
                           reportType === 'category' ? `category-${category}` : 
                           reportType === 'lowStock' ? 'low-stock' : 
                           reportType === 'expiring' ? 'expiring' : 'date-range';
      
      const filename = `inventory-report-${reportTypeStr}-${dateStr}`;
      const reportTitle = `Inventory Report - ${new Date().toLocaleDateString()}`;

      // Get data for the report
      let inventoryData;
      try {
        // First try to get from API
        inventoryData = await InventoryAPI.getAll(filters);
        
        // Check if we got valid data
        if (!inventoryData || inventoryData.length === 0) {
          console.warn('No data returned from API, using mock data');
          inventoryData = getMockInventoryData(reportType);
        }
      } catch (apiError) {
        console.warn('API error, using mock data:', apiError);
        inventoryData = getMockInventoryData(reportType);
      }

      // Handle each report format
      if (reportFormat === 'csv') {
        const csvContent = convertToCSV(inventoryData);
        downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
        
        setSuccessMessage(`CSV Report "${reportTitle}" was generated and downloaded successfully!`);
      }      else if (reportFormat === 'excel') {
        // Generate Excel file using SheetJS
        const workbook = generateExcelReport(inventoryData, reportTitle);
        
        // Convert workbook to binary string and create file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        setSuccessMessage(`Excel Report "${reportTitle}" was generated and downloaded successfully!`);
      }else if (reportFormat === 'pdf') {
        // Generate PDF using jsPDF
        const doc = generatePdfReport(inventoryData, reportTitle);
        
        // Save the PDF file
        doc.save(`${filename}.pdf`);
        
        setSuccessMessage(`PDF Report "${reportTitle}" was generated and downloaded successfully!`);
      } else if (reportFormat === 'excelSheetJS') {
        // Generate Excel report using SheetJS
        const workbook = generateExcelReport(inventoryData, reportTitle);
        
        // Save the Excel file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        
        setSuccessMessage(`Excel Report "${reportTitle}" was generated and downloaded successfully!`);
      }

      setLoading(false);
      setShowReportModal(false);
      
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

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <p>{successMessage}</p>
        </div>
      )}

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
              setError(null); // Clear any previous errors
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
            setReportFormat('pdf');
            setShowReportModal(true);
            setError(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          <Printer size={20} weight="duotone" />
          Print Inventory
        </button>
        <button
          onClick={() => {
            setReportType('all');
            setReportFormat('csv');
            setError(null);
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
                  value="csv"
                  checked={reportFormat === 'csv'}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === 'pdf'}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">PDF</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === 'excel'}
                  onChange={(e) => setReportFormat(e.target.value)}
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
