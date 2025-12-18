// src/components/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css';
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  UserCircle,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
// Import your logos (PNG files that exist under src/assets/images)
import tadbeerLogo from '../assets/images/tadbeer-logo.png';
import ooredooLogo from '../assets/images/ooredoo-logo.png';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard', 
  showSearch = true,
  onMenuToggle,
  sidebarOpen = false
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New ticket assigned', message: 'Support ticket #1245', time: '5m ago', unread: true },
    { id: 2, title: 'Task completed', message: 'Performance report ready', time: '1h ago', unread: true },
    { id: 3, title: 'Team update', message: 'Weekly meeting scheduled', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Section - Menu & Logo */}
        <div className="header-left">
          <button 
            className="menu-toggle-btn"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
          
          <div className="header-logo" onClick={() => navigate('/')}>
            <img src={tadbeerLogo} alt="Tadbeer Logo" className="logo-image" />
          </div>
      
          {/* Ooredoo Logo */}
          <div className="header-brand">
            <span className="powered-by">Powered by</span>
            <img src={ooredooLogo} alt="Ooredoo" className="ooredoo-logo" />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="header-right">
          {/* Search */}
          {showSearch && (
            <div className={`header-search ${searchOpen ? 'open' : ''}`}>
              <button 
                className="header-icon-btn search-trigger"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={2} />
              </button>
              <input
                type="text"
                className="search-input"
                placeholder="Search tickets, tasks..."
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
            </div>
          )}

          {/* Notifications */}
          <div className="header-dropdown">
            <button 
              className="header-icon-btn"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {notificationOpen && (
              <>
                <div 
                  className="dropdown-overlay" 
                  onClick={() => setNotificationOpen(false)}
                ></div>
                <div className="dropdown-menu notifications-menu">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn">Mark all as read</button>
                  </div>
                  <div className="dropdown-body">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.unread ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                        </div>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button className="view-all-btn">View all notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button 
            className="header-icon-btn"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={2} />
          </button>

          {/* Profile Dropdown */}
          <div className="header-dropdown">
            <button 
              className="header-profile-btn"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              aria-label="Profile"
            >
              <div className="profile-avatar">
                <User size={18} strokeWidth={2} />
              </div>
              <div className="profile-info">
                <span className="profile-name">Mohammad Almasr</span>
                <span className="profile-role">Admin</span>
              </div>
              <ChevronDown size={16} strokeWidth={2} />
            </button>

            {profileOpen && (
              <>
                <div 
                  className="dropdown-overlay" 
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="dropdown-menu profile-menu">
                  <div className="dropdown-header profile-header">
                    <div className="profile-avatar large">
                      <User size={24} strokeWidth={2} />
                    </div>
                    <div className="profile-details">
                      <h4>Mohammad Almasr</h4>
                      <p>mohammad@ooredoo.ps</p>
                    </div>
                  </div>
                  <div className="dropdown-body">
                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                      <UserCircle size={18} strokeWidth={2} />
                      <span>My Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => navigate('/settings')}>
                      <Settings size={18} strokeWidth={2} />
                      <span>Settings</span>
                    </button>
                    <button className="dropdown-item" onClick={() => navigate('/help')}>
                      <HelpCircle size={18} strokeWidth={2} />
                      <span>Help & Support</span>
                    </button>
                  </div>
                  <div className="dropdown-footer">
                    <button className="dropdown-item logout" onClick={() => navigate('/login')}>
                      <LogOut size={18} strokeWidth={2} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
