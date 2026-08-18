import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../../slices/userApiSlice';
import { setCredentials } from '../../slices/authSlice';
import Button from '../../components/buttons/Button';
import FloatingShapes from '../../components/common/FloatingShapes';
import logoPath from '../../assets/images/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // RTK Query hook
  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field errors on change
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

    try {
      const result = await login({
        identifier: formData.identifier,
        password: formData.password,
      }).unwrap();

      if (result.success) {
        // Save user info and token to Redux + localStorage
        dispatch(
          setCredentials({
            token: result.token,
            user: result.user,
          })
        );

        // Check if 2FA is required – redirect to OTP verification
        if (result.tempToken) {
          navigate('/verify-otp', { state: { tempToken: result.tempToken } });
        } else {
          // No 2FA – redirect based on role
          const userRole = result.user?.role;
          if (userRole === 'admin' || userRole === 'super_admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/home');
          }
        }
      } else {
        setErrors({ submit: result.message || 'Login failed' });
      }
    } catch (error) {
      const message = error?.data?.message || 'An error occurred during login.';
      setErrors({ submit: message });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FEFF]">
      {/* Mobile container */}
      <div className="max-w-md mx-auto relative min-h-screen overflow-hidden">
        <FloatingShapes />

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-[#AAC0E1]/20 shadow-sm hover:bg-white transition-all duration-300 mb-6"
          >
            <ArrowLeft size={20} className="text-[#0E2F76]" strokeWidth={2} />
          </button>

          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <div className="p-3 bg-white rounded-[24px] shadow-lg shadow-[#0E2F76]/5">
                <img
                  src={logoPath}
                  alt="Hostix Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#0E2F76] mb-2 font-inter text-center">
              Welcome Back
            </h1>
            <p className="text-center text-[#0E2F76]/60 text-sm font-inter">
              Sign in to access your hostel account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
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
                  placeholder="e.g., 2021/12345 or user@domain.com"
                  className={`w-full pl-12 pr-4 py-4 bg-white rounded-[16px] border ${
                    errors.identifier ? 'border-red-400' : 'border-[#AAC0E1]/30'
                  } focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 outline-none transition-all duration-300 text-[#0E2F76] placeholder-[#AAC0E1] font-inter text-base`}
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1.5 text-red-500 text-xs font-inter pl-2">
                  {errors.identifier}
                </p>
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
                  className={`w-full pl-12 pr-12 py-4 bg-white rounded-[16px] border ${
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
                  {showPassword ? (
                    <EyeOff size={20} strokeWidth={2} />
                  ) : (
                    <Eye size={20} strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-500 text-xs font-inter pl-2">
                  {errors.password}
                </p>
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

            {/* Spacer */}
            <div className="flex-1" />

            {/* Login Button */}
            <div className="pb-6">
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
              <p className="text-center text-[#0E2F76]/40 text-xs mt-4 font-inter">
                Use your school credentials to sign in
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;