import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building2,
} from 'lucide-react';
import Button from '../../../components/buttons/Button';
import logoPath from '../../../assets/images/logo.png';
import { useLoginMutation } from '../../../slices/userApiSlice';
import { setCredentials } from '../../../slices/authSlice';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // RTK Query login hook
  const [login] = useLoginMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or Matric Number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login({
        identifier: formData.identifier,
        password: formData.password,
      }).unwrap();

      // Check if login succeeded
      if (result.success) {
        const user = result.user;
        // 🔒 Enforce admin role
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          setErrors({
            submit: 'Access denied. This portal is for administrators only.',
          });
          setIsLoading(false);
          return;
        }

        // Save user info and token
        dispatch(
          setCredentials({
            token: result.token,
            user: user,
          })
        );

        // If 2FA is enabled (though unlikely for admin), handle it
        if (result.tempToken) {
          navigate('/verify-otp', { state: { tempToken: result.tempToken } });
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setErrors({ submit: result.message || 'Login failed' });
      }
    } catch (error) {
      const message = error?.data?.message || 'An error occurred during login.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5FEFF] via-white to-[#AAC0E1]/20 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#AAC0E1] rounded-full opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0E2F76] rounded-full opacity-5" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-[24px] shadow-lg shadow-[#0E2F76]/5 mb-6">
            <img src={logoPath} alt="Hostix Logo" className="w-16 h-16 object-contain" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={24} className="text-[#0E2F76]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0E2F76] font-inter">
              Admin Portal
            </h1>
          </div>
          <p className="text-[#0E2F76]/60 text-sm font-inter">
            Sign in to manage hostel operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-lg shadow-[#0E2F76]/5 border border-[#AAC0E1]/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier Input (Email or Matric Number) */}
            <div>
              <label className="block text-sm font-medium text-[#0E2F76] mb-2 font-inter">
                Email or Matric Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail size={20} className="text-[#AAC0E1]" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="admin@hostix.com or student ID"
                  className={`w-full pl-12 pr-4 py-4 bg-[#F5FEFF] rounded-[16px] border ${
                    errors.identifier ? 'border-red-400' : 'border-[#AAC0E1]/30'
                  } focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 outline-none transition-all duration-300 text-[#0E2F76] placeholder-[#AAC0E1] font-inter text-base`}
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1.5 text-red-500 text-xs font-inter pl-2">{errors.identifier}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#0E2F76] mb-2 font-inter">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock size={20} className="text-[#AAC0E1]" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 bg-[#F5FEFF] rounded-[16px] border ${
                    errors.password ? 'border-red-400' : 'border-[#AAC0E1]/30'
                  } focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 outline-none transition-all duration-300 text-[#0E2F76] placeholder-[#AAC0E1] font-inter text-base`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAC0E1] hover:text-[#0E2F76] transition-colors duration-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-500 text-xs font-inter pl-2">{errors.password}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-[16px] animate-[slideIn_0.3s_ease-out]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-600 text-sm font-inter">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin'
              )}
            </Button>

            <p className="text-center text-[#0E2F76]/40 text-xs font-inter">
              Authorized personnel only
            </p>
          </form>
        </div>

        {/* Back to Student Portal */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#0E2F76]/50 hover:text-[#0E2F76] transition-colors duration-300 font-inter"
          >
            ← Back to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;