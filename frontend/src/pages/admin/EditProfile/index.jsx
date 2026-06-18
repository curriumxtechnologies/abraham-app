import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  Camera,
  Save,
  X
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const EditProfile = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: 'Administrator',
    lastName: '',
    email: 'admin@hostix.com',
    phone: '+234 800 000 0000',
    role: 'Hostel Administrator',
    employeeId: 'ADM/2024/001',
    department: 'Student Affairs',
    managedHostels: ['Hostel A', 'Hostel B', 'Hostel C'],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your personal and account information
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Profile updated successfully</p>
            <p className="text-xs text-green-600">Your changes have been saved.</p>
          </div>
          <button 
            onClick={() => setShowSuccess(false)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-[#0E2F76] flex items-center justify-center shadow-lg shadow-[#0E2F76]/20">
                <span className="text-white text-5xl font-bold">
                  {formData.firstName.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200">
                <Camera size={18} className="text-gray-600" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
            <p className="text-sm text-gray-500">{formData.role}</p>
            <p className="text-xs text-gray-400 mt-1">{formData.employeeId}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Personal Information */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.firstName 
                          ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76]'
                      }`}
                      disabled={isSaving}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76] transition-all duration-200"
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                            : 'border-gray-200 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76]'
                        }`}
                        disabled={isSaving}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.phone 
                            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                            : 'border-gray-200 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76]'
                        }`}
                        disabled={isSaving}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76] transition-all duration-200"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-400">Employee ID cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10 focus:border-[#0E2F76] transition-all duration-200 appearance-none"
                        disabled={isSaving}
                      >
                        <option value="Student Affairs">Student Affairs</option>
                        <option value="Hostel Management">Hostel Management</option>
                        <option value="Facilities">Facilities</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joined Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value="January 15, 2024"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Join date cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Managed Hostels */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Managed Hostels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formData.managedHostels.map((hostel, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#0E2F76]" />
                        <span className="text-sm font-medium text-gray-700">{hostel}</span>
                      </div>
                      <button 
                        type="button"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove hostel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-gray-50 rounded-xl p-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#0E2F76] hover:bg-[#0E2F76]/5 transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-gray-500">+ Add Hostel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0E2F76] text-white rounded-xl font-medium text-sm hover:bg-[#0a2560] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/profile')}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProfile;