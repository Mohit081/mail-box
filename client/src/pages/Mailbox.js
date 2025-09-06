import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Send, Star, Trash2, Search, Plus, RefreshCw } from 'lucide-react';

const Mailbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLabel, setCurrentLabel] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const labels = [
    { key: 'inbox', label: 'Inbox', icon: Mail },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'drafts', label: 'Drafts', icon: Star },
    { key: 'important', label: 'Important', icon: Star },
    { key: 'trash', label: 'Trash', icon: Trash2 }
  ];

  useEffect(() => {
    fetchEmails();
  }, [currentLabel, pagination.current, searchTerm]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        label: currentLabel,
        page: pagination.current,
        limit: 20
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/emails?${params}`);
      setEmails(response.data.emails);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (label) => {
    setCurrentLabel(label);
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedEmails([]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email._id));
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedEmails.map(emailId =>
          axios.put(`/api/emails/${emailId}`, { isRead: true })
        )
      );
      toast.success('Emails marked as read');
      fetchEmails();
      setSelectedEmails([]);
    } catch (error) {
      toast.error('Failed to mark emails as read');
    }
  };

  const handleMarkAsImportant = async () => {
    try {
      await Promise.all(
        selectedEmails.map(emailId =>
          axios.put(`/api/emails/${emailId}`, { isImportant: true })
        )
      );
      toast.success('Emails marked as important');
      fetchEmails();
      setSelectedEmails([]);
    } catch (error) {
      toast.error('Failed to mark emails as important');
    }
  };

  const handleDeleteEmails = async () => {
    try {
      await Promise.all(
        selectedEmails.map(emailId =>
          axios.delete(`/api/emails/${emailId}`)
        )
      );
      toast.success('Emails moved to trash');
      fetchEmails();
      setSelectedEmails([]);
    } catch (error) {
      toast.error('Failed to delete emails');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mailbox</h1>
          <div className="d-flex justify-content-between align-items-center">
            <p className="page-subtitle">Manage your emails</p>
            <Link to="/compose" className="btn btn-primary">
              <Plus className="inline-block mr-2" size={16} />
              Compose
            </Link>
          </div>
        </div>

        <div className="mailbox-container">
          {/* Sidebar */}
          <div className="mailbox-sidebar">
            <ul className="sidebar-menu">
              {labels.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button
                    onClick={() => handleLabelChange(key)}
                    className={currentLabel === key ? 'active' : ''}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="mailbox-content">
            {/* Search and Actions */}
            <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
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
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                    style={{ paddingLeft: '35px' }}
                  />
                </div>
                <button
                  onClick={fetchEmails}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {selectedEmails.length > 0 && (
                <div className="d-flex gap-2">
                  <button
                    onClick={handleMarkAsRead}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={handleMarkAsImportant}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Mark Important
                  </button>
                  <button
                    onClick={handleDeleteEmails}
                    className="btn btn-danger"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Email List */}
            <div className="email-list">
              {loading ? (
                <div className="loading">
                  <div>Loading emails...</div>
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center" style={{ padding: '40px', color: '#666' }}>
                  <Mail size={48} className="mb-3" style={{ opacity: 0.5 }} />
                  <p>No emails in {currentLabel}</p>
                  {currentLabel === 'inbox' && (
                    <Link to="/compose" className="btn btn-primary mt-3">
                      Compose Email
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === emails.length && emails.length > 0}
                        onChange={handleSelectAll}
                      />
                      Select All
                    </label>
                  </div>

                  {emails.map((email) => (
                    <div 
                      key={email._id} 
                      className={`email-item ${!email.isRead ? 'unread' : ''}`}
                    >
                      <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email._id)}
                          onChange={() => handleSelectEmail(email._id)}
                          style={{ marginRight: '8px' }}
                        />
                        
                        <div className="user-avatar" style={{ minWidth: '40px' }}>
                          {getInitials(email.from.firstName, email.from.lastName)}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div className="email-header">
                            <div className="email-sender">
                              {email.from.firstName} {email.from.lastName}
                            </div>
                            <div className="email-time">
                              {formatDate(email.createdAt)}
                            </div>
                          </div>
                          <div className="email-subject">{email.subject}</div>
                          <div className="email-preview">
                            {email.body.length > 100 
                              ? `${email.body.substring(0, 100)}...` 
                              : email.body
                            }
                          </div>
                          <div className="email-actions">
                            <Link 
                              to={`/email/${email._id}`} 
                              className="btn btn-outline"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              View
                            </Link>
                            {email.isImportant && (
                              <span className="status-badge status-active">
                                <Star size={12} className="inline-block mr-1" />
                                Important
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

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
      </div>
    </div>
  );
};

export default Mailbox;
