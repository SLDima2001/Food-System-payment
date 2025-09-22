import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const FarmerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
    experience: '',
    specializations: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const specialtyOptions = [
    'Vegetables', 'Fruits', 'Herbs', 'Grains', 'Organic', 'Greenhouse', 'Livestock', 'Dairy'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecializationChange = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialty)
        ? prev.specializations.filter(s => s !== specialty)
        : [...prev.specializations, specialty]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required';
    if (!formData.farmLocation.trim()) newErrors.farmLocation = 'Farm location is required';
    if (!formData.farmSize.trim()) newErrors.farmSize = 'Farm size is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare farmer registration data
      const farmerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmSize: formData.farmSize,
        experience: formData.experience,
        specializations: formData.specializations,
        userType: 'farmer'
      };

      // Register farmer with backend API
      console.log('🚀 Attempting farmer registration with data:', farmerData);
      const response = await api.post('/users/register', farmerData);
      console.log('✅ Registration successful:', response);
      
      if (response.token) {
        // Store authentication token
        localStorage.setItem('token', response.token);
        localStorage.setItem('farmerUser', JSON.stringify(response.user));
        
        // Redirect to farmer dashboard
        navigate('/farmer/dashboard');
      }
    } catch (error) {
      console.error('❌ Farmer registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.status
      });
      
      // Check if it's a network error (backend not running)
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setErrors({ submit: 'Cannot connect to server. Please make sure the backend is running on port 5000.' });
      } else if (error.message.includes('400')) {
        setErrors({ submit: 'Registration failed. Please check your information.' });
      } else if (error.message.includes('409')) {
        setErrors({ submit: 'Email already exists. Please use a different email.' });
      } else if (error.message.includes('500')) {
        setErrors({ submit: 'Server error. Please try again later.' });
      } else {
        setErrors({ submit: `Registration failed: ${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{backgroundColor: '#0b2f00'}}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center" style={{backgroundColor: '#51ac37'}}>
            <h1 className="text-3xl font-bold text-white">Join GreenHarvest as a Farmer</h1>
            <p className="text-green-100 mt-2">Start selling your fresh produce to customers</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Farm Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.farmName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your farm name"
                  />
                  {errors.farmName && <p className="text-red-500 text-xs mt-1">{errors.farmName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    name="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.farmLocation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter farm location"
                  />
                  {errors.farmLocation && <p className="text-red-500 text-xs mt-1">{errors.farmLocation}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Size *
                  </label>
                  <select
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.farmSize ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select farm size</option>
                    <option value="small">Small (0-5 acres)</option>
                    <option value="medium">Medium (5-20 acres)</option>
                    <option value="large">Large (20+ acres)</option>
                  </select>
                  {errors.farmSize && <p className="text-red-500 text-xs mt-1">{errors.farmSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (3-10 years)</option>
                    <option value="experienced">Experienced (10+ years)</option>
                  </select>
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(specialty)}
                        onChange={() => handleSpecializationChange(specialty)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                style={{backgroundColor: '#51ac37'}}
              >
                {isLoading ? 'Creating Account...' : 'Create Farmer Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/farmer/login" className="text-green-600 hover:text-green-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerSignup;