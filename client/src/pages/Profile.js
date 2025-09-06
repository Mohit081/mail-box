import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Calendar, MapPin, Save, Edit } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
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
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.dateOfBirth && new Date(formData.dateOfBirth) >= new Date()) {
      newErrors.dateOfBirth = 'Date of birth must be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: Object.values(formData.address).some(val => val.trim()) ? formData.address : undefined
      };

      const response = await axios.put(`/api/users/${user.id}`, submitData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Profile Header */}
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>
                    {user.firstName} {user.lastName}
                  </h2>
                  <p style={{ margin: 0, color: '#666' }}>
                    {user.email}
                  </p>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setEditing(!editing)}
                className="btn btn-outline"
              >
                <Edit className="inline-block mr-2" size={16} />
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  <User className="inline-block mr-2" size={16} />
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  disabled={!editing || loading}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  <User className="inline-block mr-2" size={16} />
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  disabled={!editing || loading}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail className="inline-block mr-2" size={16} />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'error' : ''}`}
                disabled={!editing || loading}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <Phone className="inline-block mr-2" size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-control ${errors.phone ? 'error' : ''}`}
                  disabled={!editing || loading}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  <Calendar className="inline-block mr-2" size={16} />
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`form-control ${errors.dateOfBirth ? 'error' : ''}`}
                  disabled={!editing || loading}
                />
                {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin className="inline-block mr-2" size={16} />
                Address
              </label>
              <div className="form-row">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Street Address"
                  disabled={!editing || loading}
                />
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="City"
                  disabled={!editing || loading}
                />
              </div>
              <div className="form-row mt-3">
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="State"
                  disabled={!editing || loading}
                />
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="ZIP Code"
                  disabled={!editing || loading}
                />
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Country"
                  disabled={!editing || loading}
                />
              </div>
            </div>

            {editing && (
              <div className="text-right">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save className="inline-block mr-2" size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>

          {/* Account Information */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Account Information</h3>
            <div className="d-flex justify-content-between" style={{ marginBottom: '10px' }}>
              <span style={{ color: '#666' }}>Member since:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="d-flex justify-content-between" style={{ marginBottom: '10px' }}>
              <span style={{ color: '#666' }}>Last login:</span>
              <span>{formatDate(user.lastLogin)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span style={{ color: '#666' }}>Account status:</span>
              <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
