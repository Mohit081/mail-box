import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Mail, Users, Send, Trash2, Star, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmails: 0,
    unreadEmails: 0,
    sentEmails: 0,
    drafts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch email stats
      const emailStatsResponse = await axios.get('/api/emails?limit=1');
      const inboxResponse = await axios.get('/api/emails?label=inbox&limit=1');
      const sentResponse = await axios.get('/api/emails?label=sent&limit=1');
      const draftsResponse = await axios.get('/api/emails?label=drafts&limit=1');
      
      // Fetch recent emails
      const recentResponse = await axios.get('/api/emails?limit=5');
      
      setStats({
        totalEmails: emailStatsResponse.data.pagination.total,
        unreadEmails: inboxResponse.data.emails.filter(email => !email.isRead).length,
        sentEmails: sentResponse.data.pagination.total,
        drafts: draftsResponse.data.pagination.total,
        totalUsers: user.role === 'admin' ? await fetchUserCount() : 0
      });
      
      setRecentEmails(recentResponse.data.emails);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await axios.get('/api/users?limit=1');
      return response.data.pagination.total;
    } catch (error) {
      return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user.firstName}!</h1>
          <p className="page-subtitle">Here's what's happening with your mailbox</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalEmails}</div>
            <div className="stat-label">
              <Mail className="inline-block mr-2" size={20} />
              Total Emails
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.unreadEmails}</div>
            <div className="stat-label">
              <Clock className="inline-block mr-2" size={20} />
              Unread Emails
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.sentEmails}</div>
            <div className="stat-label">
              <Send className="inline-block mr-2" size={20} />
              Sent Emails
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{stats.drafts}</div>
            <div className="stat-label">
              <Star className="inline-block mr-2" size={20} />
              Drafts
            </div>
          </div>
          
          {user.role === 'admin' && (
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">
                <Users className="inline-block mr-2" size={20} />
                Total Users
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="d-flex gap-3">
            <Link to="/compose" className="btn btn-primary">
              <Send className="inline-block mr-2" size={16} />
              Compose Email
            </Link>
            <Link to="/mailbox" className="btn btn-outline">
              <Mail className="inline-block mr-2" size={16} />
              View Mailbox
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin/users" className="btn btn-outline">
                <Users className="inline-block mr-2" size={16} />
                Manage Users
              </Link>
            )}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Emails</h3>
          </div>
          
          {recentEmails.length === 0 ? (
            <div className="text-center" style={{ padding: '40px', color: '#666' }}>
              <Mail size={48} className="mb-3" style={{ opacity: 0.5 }} />
              <p>No emails yet. Start by composing your first email!</p>
              <Link to="/compose" className="btn btn-primary mt-3">
                Compose Email
              </Link>
            </div>
          ) : (
            <div className="email-list">
              {recentEmails.map((email) => (
                <div key={email._id} className="email-item">
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
                    {!email.isRead && (
                      <span className="status-badge status-active">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-3">
                <Link to="/mailbox" className="btn btn-outline">
                  View All Emails
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
