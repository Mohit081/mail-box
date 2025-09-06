import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Mail, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <Mail className="inline-block mr-2" size={20} />
          Mailbox App
        </Link>

        {user && (
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/mailbox" 
                className={isActive('/mailbox') ? 'active' : ''}
              >
                Mailbox
              </Link>
            </li>
            <li>
              <Link 
                to="/compose" 
                className={isActive('/compose') ? 'active' : ''}
              >
                Compose
              </Link>
            </li>
            {user.role === 'admin' && (
              <li>
                <Link 
                  to="/admin/users" 
                  className={isActive('/admin/users') ? 'active' : ''}
                >
                  <Users className="inline-block mr-1" size={16} />
                  Users
                </Link>
              </li>
            )}
            
            <li className="user-menu">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <User size={16} />
                {user.firstName}
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="inline-block mr-2" size={16} />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      background: 'none', 
                      border: 'none',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
