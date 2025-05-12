import { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash, EnvelopeSimple, Phone, Key, X } from '@phosphor-icons/react';
import api from '../../../utils/api';
import EmployeeModal from './EmployeeModal';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError(
        'Failed to fetch employees: ' + (err.response?.data?.msg || err.message)
      );
      console.error('Error fetching employees:', err);
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
      await api.delete(`api/employees/${employeeId}`);
      fetchEmployees();
    } catch (err) {
      setError(
        'Failed to delete employee: ' + (err.response?.data?.msg || err.message)
      );
      console.error('Error deleting employee:', err);
    }
  };

  const handleResetPassword = async (employeeId) => {
    if (
      !window.confirm(
        "Are you sure you want to reset this employee's password?"
      )
    ) {
      return;
    }

    try {
      const response = await api.put(`api/employees/${employeeId}/reset-password`);
      setTemporaryPassword(response.data.temporaryPassword);
      setCurrentEmployee(
        employees.find(
          (emp) => emp.user_id === employeeId || emp.id === employeeId
        )
      );
      setShowModal(true);
    } catch (err) {
      setError(
        'Failed to reset password: ' + (err.response?.data?.msg || err.message)
      );
      console.error('Error resetting password:', err);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (currentEmployee) {
        // Update existing employee
        await api.put(`api/employees/${currentEmployee.user_id}`, employeeData);
      } else {
        // Create new employee
        const response = await api.post('api/employees', employeeData);
        // If response includes temporary password
        if (response.data.temporaryPassword) {
          setTemporaryPassword(response.data.temporaryPassword);
        }
      }

      fetchEmployees();

      // Only close modal if no temporary password was returned
      if (!temporaryPassword) {
        setShowModal(false);
      }
    } catch (err) {
      setError(
        'Failed to save employee: ' + (err.response?.data?.msg || err.message)
      );
      console.error('Error saving employee:', err);
    }
  };

  const closeModalAndReset = () => {
    setShowModal(false);
    setTemporaryPassword('');
    fetchEmployees();
  };

  // Filter employees based on search term and status
  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (employee.position &&
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          <button
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white"
            onClick={handleAddEmployee}
          >
            <Plus size={20} weight="bold" />
            Add Employee
          </button>
        </div>

        {error && (
          <div className="relative mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass size={20} className="text-gray-400" weight="duotone" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="Search by name, position, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X size={18} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Employees Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.user_id || employee.id}
              className="overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <div className="border-b p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {employee.first_name}{' '}
                      {employee.last_name}
                    </h3>
                    <p className="text-gray-600">{employee.position}</p>
                    {employee.department && (
                      <p className="text-sm text-gray-500">
                        {employee.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center text-sm">
                  <EnvelopeSimple size={16} className="mr-2 text-gray-400" weight='duotone' />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone size={16} className="mr-2 text-gray-400" weight='duotone' />
                  <span>{employee.contact_number}</span>
                </div>
                {employee.salary && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">Salary:</span>
                    <span className="ml-2">
                      {'Rs. '}
                      {parseFloat(employee.salary).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {employee.hire_date && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">Hired:</span>
                    <span className="ml-2">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 border-t bg-gray-50 p-4">
                <button
                  className="p-1 text-amber-500 hover:text-amber-700"
                  title="Reset Password"
                  onClick={() =>
                    handleResetPassword(employee.user_id || employee.id)
                  }
                >
                  <Key size={18} weight="duotone" />
                </button>
                <button
                  className="p-1 text-blue-500 hover:text-blue-700"
                  onClick={() => handleEditEmployee(employee)}
                >
                  <Pencil size={18} weight="duotone" />
                </button>
                <button
                  className="p-1 text-red-500 hover:text-red-700"
                  onClick={() =>
                    handleDeleteEmployee(employee.user_id || employee.id)
                  }
                >
                  <Trash size={18} weight="duotone" />
                </button>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-3 py-8 text-center">
              <p className="text-gray-500">
                No employees found matching your criteria.
              </p>
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
      />
    </DashboardLayout>
  );
};

export default Employees;
