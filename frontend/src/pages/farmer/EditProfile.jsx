import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
    experience: '',
    specializations: [],
    bio: '',
    profileImage: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const specialtyOptions = [
    'Vegetables', 'Fruits', 'Herbs', 'Grains', 'Organic', 'Greenhouse', 'Livestock', 'Dairy'
  ];

  useEffect(() => {
    loadFarmerProfile();
  }, []);

  const loadFarmerProfile = async () => {
    try {
      setIsLoading(true);
      // Get current user data from API
      const response = await api.getCurrentUser();
      
      if (response && response.name) {
        setFormData({
          name: response.name || '',
          email: response.email || '',
          phone: response.phone || '',
          farmName: response.farmName || '',
          farmLocation: response.farmLocation || '',
          farmSize: response.farmSize || '',
          experience: response.experience || '',
          specializations: response.specializations || [],
          bio: response.bio || '',
          profileImage: response.profilePicture || ''
        });
      } else {
        // Fallback to localStorage if API fails
        const farmerUser = JSON.parse(localStorage.getItem('farmerUser'));
        if (farmerUser) {
          setFormData({
            name: farmerUser.name || '',
            email: farmerUser.email || '',
            phone: farmerUser.phone || '',
            farmName: farmerUser.farmName || '',
            farmLocation: farmerUser.farmLocation || '',
            farmSize: farmerUser.farmSize || '',
            experience: farmerUser.experience || '',
            specializations: farmerUser.specializations || [],
            bio: farmerUser.bio || '',
            profileImage: farmerUser.profileImage || farmerUser.profilePicture || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to load farmer profile:', error);
      // Fallback to localStorage
      const farmerUser = JSON.parse(localStorage.getItem('farmerUser'));
      if (farmerUser) {
        setFormData({
          name: farmerUser.name || '',
          email: farmerUser.email || '',
          phone: farmerUser.phone || '',
          farmName: farmerUser.farmName || '',
          farmLocation: farmerUser.farmLocation || '',
          farmSize: farmerUser.farmSize || '',
          experience: farmerUser.experience || '',
          specializations: farmerUser.specializations || [],
          bio: farmerUser.bio || '',
          profileImage: farmerUser.profileImage || farmerUser.profilePicture || ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required';
    if (!formData.farmLocation.trim()) newErrors.farmLocation = 'Farm location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      // Prepare profile data for API
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmSize: formData.farmSize,
        experience: formData.experience,
        specializations: formData.specializations,
        bio: formData.bio,
        profilePicture: formData.profileImage
      };

      // Update farmer profile via API
      const response = await api.updateProfile(profileData);
      
      // Update localStorage with new data
      if (response.user) {
        localStorage.setItem('farmerUser', JSON.stringify(response.user));
      }
      
      alert('Profile updated successfully!');
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message.includes('400')) {
        setErrors({ submit: 'Invalid profile data. Please check your inputs.' });
      } else if (error.message.includes('401')) {
        setErrors({ submit: 'Please login again to update your profile.' });
        navigate('/farmer/login');
      } else {
        setErrors({ submit: 'Failed to update profile. Please try again. Error: ' + error.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your products and data. Are you absolutely sure?')) {
      return;
    }

    try {
      // In a real app, this would be an API call
      // await api.delete(`/users/farmer/${farmerUser.id}`);
      
      localStorage.removeItem('farmerUser');
      localStorage.removeItem('token');
      
      alert('Account deleted successfully.');
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your farmer profile and farm information</p>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Farm Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.farmName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.farmName && <p className="text-red-600 text-sm mt-1">{errors.farmName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    name="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.farmLocation ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.farmLocation && <p className="text-red-600 text-sm mt-1">{errors.farmLocation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Size
                  </label>
                  <select
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select farm size</option>
                    <option value="small">Small (Under 5 acres)</option>
                    <option value="medium">Medium (5-20 acres)</option>
                    <option value="large">Large (20+ acres)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farming Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (3-10 years)</option>
                    <option value="experienced">Experienced (10+ years)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialtyOptions.map(specialty => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(specialty)}
                      onChange={() => handleSpecializationChange(specialty)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Description
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell customers about yourself and your farming practices..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/farmer/dashboard')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your profile, products, and all associated data.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;