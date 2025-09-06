import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Reply, Forward, Trash2, Star, Clock, User } from 'lucide-react';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEmail();
  }, [id]);

  const fetchEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/emails/${id}`);
      setEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching email:', error);
      toast.error('Failed to fetch email');
      navigate('/mailbox');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    navigate(`/compose?reply=${id}`);
  };

  const handleForward = () => {
    navigate(`/compose?forward=${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        setActionLoading(true);
        await axios.delete(`/api/emails/${id}`);
        toast.success('Email moved to trash');
        navigate('/mailbox');
      } catch (error) {
        console.error('Error deleting email:', error);
        toast.error('Failed to delete email');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleImportant = async () => {
    try {
      setActionLoading(true);
      const updatedEmail = await axios.put(`/api/emails/${id}`, {
        isImportant: !email.isImportant
      });
      setEmail(updatedEmail.data.email);
      toast.success(email.isImportant ? 'Removed from important' : 'Marked as important');
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Failed to update email');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">
            <div>Loading email...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '40px' }}>
            <h2>Email not found</h2>
            <button onClick={() => navigate('/mailbox')} className="btn btn-primary">
              Back to Mailbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/mailbox')}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="page-title">{email.subject}</h1>
          </div>
        </div>

        <div className="card">
          {/* Email Header */}
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-3">
                <div className="user-avatar" style={{ width: '50px', height: '50px' }}>
                  {getInitials(email.from.firstName, email.from.lastName)}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h3 style={{ margin: 0, fontSize: '18px' }}>
                      {email.from.firstName} {email.from.lastName}
                    </h3>
                    {email.isImportant && (
                      <Star size={16} style={{ color: '#ffc107' }} />
                    )}
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {email.from.email}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  <Clock className="inline-block mr-1" size={14} />
                  {formatDate(email.createdAt)}
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handleReply}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Reply size={14} className="inline-block mr-1" />
                    Reply
                  </button>
                  <button
                    onClick={handleForward}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Forward size={14} className="inline-block mr-1" />
                    Forward
                  </button>
                  <button
                    onClick={handleToggleImportant}
                    className={`btn ${email.isImportant ? 'btn-secondary' : 'btn-outline'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    disabled={actionLoading}
                  >
                    <Star size={14} className="inline-block mr-1" />
                    {email.isImportant ? 'Important' : 'Mark Important'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    disabled={actionLoading}
                  >
                    <Trash2 size={14} className="inline-block mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients */}
          {(email.to.length > 0 || email.cc.length > 0 || email.bcc.length > 0) && (
            <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div className="d-flex gap-4">
                {email.to.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '14px', color: '#333' }}>To:</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {email.to.map((recipient, index) => (
                        <span key={index}>
                          {recipient.firstName} {recipient.lastName} &lt;{recipient.email}&gt;
                          {index < email.to.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {email.cc.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '14px', color: '#333' }}>CC:</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {email.cc.map((recipient, index) => (
                        <span key={index}>
                          {recipient.firstName} {recipient.lastName} &lt;{recipient.email}&gt;
                          {index < email.cc.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {email.bcc.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '14px', color: '#333' }}>BCC:</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {email.bcc.map((recipient, index) => (
                        <span key={index}>
                          {recipient.firstName} {recipient.lastName} &lt;{recipient.email}&gt;
                          {index < email.bcc.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div style={{ padding: '20px' }}>
            <div 
              style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.6', 
                fontSize: '16px',
                color: '#333'
              }}
            >
              {email.body}
            </div>
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0' }}>
              <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Attachments</h4>
              <div className="d-flex gap-3">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="card" style={{ padding: '10px', minWidth: '200px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {attachment.originalName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
