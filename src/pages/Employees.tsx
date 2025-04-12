import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  Building,
  MoreVertical,
  X,
  User,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Employee type definition
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  image_url: string;
}

// Default profile image
const defaultProfileImage = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

function Employees() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Current employee for edit/view/delete
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  
  // Form state for adding/editing employee
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    status: 'Active',
    image_url: defaultProfileImage
  });

  // Fetch employees from Supabase
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        setError('Failed to fetch employees');
        console.error('Error fetching employees:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEmployees();
  }, []);

  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      status: 'Active',
      image_url: defaultProfileImage
    });
  };

  // Open add employee modal
  const openAddModal = () => {
    resetForm();
    setCurrentEmployee(null);
    setIsAddModalOpen(true);
  };

  // Open edit employee modal
  const openEditModal = (employee: Employee) => {
    setFormData({ ...employee });
    setCurrentEmployee(employee);
    setIsAddModalOpen(true);
  };

  // Open view employee modal
  const openViewModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsViewModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle employee form submission (add/edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentEmployee) {
        // Edit existing employee
        const { error } = await supabase
          .from('employees')
          .update(formData)
          .eq('id', currentEmployee.id);
        
        if (error) throw error;
        
        // Update local state
        setEmployees(employees.map(emp => 
          emp.id === currentEmployee.id ? { ...formData, id: currentEmployee.id } : emp
        ));
      } else {
        // Add new employee
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        // Create new employee with user_id
        const { data, error } = await supabase
          .from('employees')
          .insert([{ ...formData, user_id: user.id }])
          .select();
        
        if (error) throw error;
        if (data && data.length > 0) {
          setEmployees([...employees, data[0]]);
        }
      }
      
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Failed to save employee. Please try again.');
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async () => {
    if (currentEmployee) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', currentEmployee.id);
        
        if (error) throw error;
        
        // Update local state
        setEmployees(employees.filter(emp => emp.id !== currentEmployee.id));
        setIsDeleteModalOpen(false);
        setCurrentEmployee(null);
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Employee menu for each card
  const EmployeeMenu = ({ employee }: { employee: Employee }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button 
          className="text-gray-400 hover:text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setIsOpen(false);
                  openViewModal(employee);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setIsOpen(false);
                  openEditModal(employee);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setIsOpen(false);
                  openDeleteModal(employee);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employees</h1>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onClick={openAddModal}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 py-10 flex justify-center">
              <div className="animate-pulse">Loading employees...</div>
            </div>
          ) : error ? (
            <div className="col-span-3 py-10 text-center">
              <div className="text-red-500 mb-2">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Try again
              </button>
            </div>
          ) : filteredEmployees.length === 0 && searchTerm ? (
            <div className="col-span-3 py-10 text-center">
              <p className="text-gray-600 mb-2">No employees matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Clear search
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No employees yet</h3>
              <p className="text-gray-500 mb-4">Add your first team member to get started!</p>
              <button 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                onClick={openAddModal}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Employee
              </button>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-white rounded-lg border p-4 hover:border-indigo-500 transition-colors">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={employee.image_url}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                  </div>
                  <EmployeeMenu employee={employee} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    {employee.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {employee.phone}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                  <button 
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    onClick={() => openViewModal(employee)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Employee Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position/Title *
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      id="image_url"
                      name="image_url"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.image_url}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use default image</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {currentEmployee ? 'Save Changes' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
        {isViewModalOpen && currentEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Employee Profile</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col items-center mb-6 pb-6 border-b">
                  <img
                    src={currentEmployee.image_url}
                    alt={currentEmployee.name}
                    className="w-24 h-24 rounded-full object-cover mb-3"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">{currentEmployee.name}</h3>
                  <p className="text-gray-600">{currentEmployee.position}</p>
                  <span className={`mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    currentEmployee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    currentEmployee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentEmployee.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Department</h4>
                    <p className="text-gray-900">{currentEmployee.department}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="text-gray-900">{currentEmployee.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                    <p className="text-gray-900">{currentEmployee.phone}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(currentEmployee);
                    }}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openDeleteModal(currentEmployee);
                    }}
                    className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && currentEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4 text-red-600">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Delete Employee</h3>
                <p className="text-center text-gray-600 mb-6">
                  Are you sure you want to delete {currentEmployee.name}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEmployee}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Employees;