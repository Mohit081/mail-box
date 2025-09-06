import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Search, Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/users?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}/activate`);
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        toast.success('User deactivated successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to deactivate user');
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>

        {/* Search and Actions */}
        <div className="card mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#666' 
                }} 
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
                style={{ paddingLeft: '35px' }}
              />
            </div>
            
            <div className="d-flex gap-2">
              <span style={{ alignSelf: 'center', color: '#666' }}>
                {pagination.total} users
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {loading ? (
            <div className="loading">
              <div>Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center" style={{ padding: '40px', color: '#666' }}>
              <Users size={48} className="mb-3" style={{ opacity: 0.5 }} />
              <p>No users found</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                  />
                  Select All ({selectedUsers.length} selected)
                </label>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleSelectUser(user._id)}
                            />
                            <div className="user-avatar">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {user.firstName} {user.lastName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                Joined {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield size={12} className="inline-block mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Users size={12} className="inline-block mr-1" />
                                User
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                            {user.isActive ? (
                              <>
                                <UserCheck size={12} className="inline-block mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX size={12} className="inline-block mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                              className="btn btn-outline"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                              title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            >
                              <Shield size={12} />
                            </button>
                            
                            {user.isActive ? (
                              <button
                                onClick={() => handleDeactivateUser(user._id)}
                                className="btn btn-danger"
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                title="Deactivate user"
                              >
                                <UserX size={12} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user._id)}
                                className="btn btn-success"
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                title="Activate user"
                              >
                                <UserCheck size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="text-center" style={{ padding: '20px' }}>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                      disabled={pagination.current === 1}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                    <span style={{ padding: '8px 16px', alignSelf: 'center' }}>
                      Page {pagination.current} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                      disabled={pagination.current === pagination.pages}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
