import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash, EnvelopeSimple, Phone, Key, X, Buildings, CalendarBlank, CurrencyDollar } from '@phosphor-icons/react';
import api from '../../../utils/api';
import EmployeeModal from './EmployeeModal';

// Reusable component for employee cards
const EmployeeCard = ({ employee, onEdit, onDelete, onResetPassword }) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-gray-600">{employee.position}</p>
            {employee.department && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Buildings size={14} className="mr-1" weight="duotone" />
                <span>{employee.department}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center text-sm">
          <EnvelopeSimple
            size={16}
            className="mr-2 text-gray-400"
            weight="duotone"
          />
          <span>{employee.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <Phone size={16} className="mr-2 text-gray-400" weight="duotone" />
          <span>{employee.contact_number}</span>
        </div>
        {employee.salary && (
          <div className="flex items-center text-sm">
            <CurrencyDollar
              size={16}
              className="mr-1 text-gray-400"
              weight="duotone"
            />
            <span className="ml-1">
              {'Rs. '}
              {parseFloat(employee.salary).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
        {employee.hire_date && (
          <div className="flex items-center text-sm">
            <CalendarBlank
              size={16}
              className="mr-1 text-gray-400"
              weight="duotone"
            />
            <span className="ml-1">
              Hired: {new Date(employee.hire_date).toLocaleDateString('en-GB')}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 border-t bg-gray-50 p-3">
        <button
          className="rounded p-1 text-amber-500 transition hover:bg-amber-50 hover:text-amber-700"
          title="Reset Password"
          onClick={() => onResetPassword(employee.user_id || employee.id)}
        >
          <Key size={18} weight="duotone" />
        </button>
        <button
          className="rounded p-1 text-blue-500 transition hover:bg-blue-50 hover:text-blue-700"
          title="Edit Employee"
          onClick={() => onEdit(employee)}
        >
          <Pencil size={18} weight="duotone" />
        </button>
        <button
          className="rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
          title="Delete Employee"
          onClick={() => onDelete(employee.user_id || employee.id)}
        >
          <Trash size={18} weight="duotone" />
        </button>
      </div>
    </div>
  );
};

EmployeeCard.propTypes = {
  employee: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onResetPassword: PropTypes.func.isRequired,
};

// Main component
const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Error handler utility function
  const handleApiError = (err, actionName) => {
    const errorMessage = err.response?.data?.msg || err.message;
    setError(`Failed to ${actionName}: ${errorMessage}`);
    console.error(`Error ${actionName}:`, err);
    return errorMessage;
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err, 'fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setTemporaryPassword('');
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setTemporaryPassword('');
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`api/employees/${employeeId}`);
      await fetchEmployees();
      setError(null);
    } catch (err) {
      handleApiError(err, 'delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (employeeId) => {
    if (!window.confirm("Are you sure you want to reset this employee's password?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.put(
        `api/employees/${employeeId}/reset-password`
      );
      setTemporaryPassword(response.data.temporaryPassword);
      setCurrentEmployee(
        employees.find(
          (emp) => emp.user_id === employeeId || emp.id === employeeId
        )
      );
      setShowModal(true);
      setError(null);
    } catch (err) {
      handleApiError(err, 'reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      setActionLoading(true);
      let newTempPassword = '';

      if (currentEmployee) {
        // Update existing employee
        await api.put(`api/employees/${currentEmployee.user_id}`, employeeData);
      } else {
        // Create new employee
        const response = await api.post('api/employees', employeeData);
        // If response includes temporary password
        if (response.data.temporaryPassword) {
          newTempPassword = response.data.temporaryPassword;
          setTemporaryPassword(newTempPassword);
        }
      }

      await fetchEmployees();
      setError(null);

      // Only close modal if no temporary password was returned
      if (!newTempPassword) {
        setShowModal(false);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'save employee');
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const closeModalAndReset = () => {
    setError(null);
    setShowModal(false);
    setTemporaryPassword('');
    fetchEmployees();
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const departmentMatch = employee.department
      ? employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const positionMatch = employee.position
      ? employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      : false;

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      positionMatch ||
      departmentMatch ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="mb-3 text-2xl font-bold text-gray-800 sm:mb-0">
            Employees
          </h1>
          <button
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
            onClick={handleAddEmployee}
            disabled={actionLoading}
          >
            <Plus size={20} weight="bold" aria-hidden="true" />
            Add Employee
          </button>
        </div>

        {error && !showModal && (
          <div
            className="relative mb-4 rounded-md bg-red-100 p-3 text-red-700"
            role="alert"
          >
            <div className="flex items-center">
              <X size={20} className="mr-2" weight="bold" aria-hidden="true" />
              {error}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass
                size={20}
                className="text-gray-400"
                weight="duotone"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="Search by name, position, department, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Employees Cards */}
        {actionLoading && (
          <div className="mb-4 flex items-center justify-center rounded-lg bg-amber-50 py-2 text-amber-700">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
            Processing request...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.user_id || employee.id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              onResetPassword={handleResetPassword}
            />
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <MagnifyingGlass
                size={48}
                className="mb-3 text-gray-300"
                weight="duotone"
              />
              <p className="text-gray-500">
                No employees found matching your criteria.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-amber-500 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <EmployeeModal
        show={showModal}
        employee={currentEmployee}
        onClose={closeModalAndReset}
        onSave={handleSaveEmployee}
        temporaryPassword={temporaryPassword}
        apiError={error}
      />
    </DashboardLayout>
  );
};

export default memo(Employees);
