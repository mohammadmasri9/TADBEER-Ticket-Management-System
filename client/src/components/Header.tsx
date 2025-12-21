// src/components/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Add this import
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
  const { user, logout } = useAuth(); // Get user from context
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New ticket assigned', message: 'Support ticket #1245', time: '5m ago', unread: true },
    { id: 2, title: 'Task completed', message: 'Performance report ready', time: '1h ago', unread: true },
    { id: 3, title: 'Team update', message: 'Weekly meeting scheduled', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get user display name (truncate if too long)
  const getDisplayName = () => {
    if (!user?.name) return 'User';
    const name = user.name;
    if (name.length > 15) {
      return name.substring(0, 15) + '...';
    }
    return name;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-dropdown')) {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
      if (!target.closest('.header-search')) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
          
          <div className="header-logo" onClick={() => navigate('/dashboard')}>
            <img src={tadbeerLogo} alt="Tadbeer Logo" className="logo-image" />
          </div>
        </div>

        {/* Center Section - Powered by Ooredoo */}
        <div className="header-center">
          <div className="header-brand">
            <span className="powered-by">POWERED BY</span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchOpen(!searchOpen);
                }}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={2} />
              </button>
              {searchOpen && (
                <form onSubmit={handleSearch} className="search-form">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search tickets, users, reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      className="search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="header-dropdown">
            <button 
              className="header-icon-btn notification-btn"
              onClick={(e) => {
                e.stopPropagation();
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
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="mark-read-btn">Mark all as read</button>
                </div>
                <div className="dropdown-body">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.unread ? 'unread' : ''}`}
                      >
                        <div className="notification-icon">
                          <Bell size={16} />
                        </div>
                        <div className="notification-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-notifications">
                      <Bell size={48} strokeWidth={1} />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn" onClick={() => navigate('/notifications')}>
                    View all notifications
                  </button>
                </div>
              </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              aria-label="Profile"
            >
              <div className="profile-avatar">
                <User size={18} strokeWidth={2} />
              </div>
              <div className="profile-info">
                <span className="profile-name">{getDisplayName()}</span>
                <span className="profile-role">{user?.role || 'User'}</span>
              </div>
              <ChevronDown 
                size={16} 
                strokeWidth={2} 
                className={`chevron-icon ${profileOpen ? 'rotated' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="dropdown-menu profile-menu">
                <div className="dropdown-header profile-header">
                  <div className="profile-avatar large">
                    <User size={24} strokeWidth={2} />
                  </div>
                  <div className="profile-details">
                    <h4>{user?.name || 'User'}</h4>
                    <p>{user?.email || 'user@tadbeer.com'}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-body">
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      navigate(`/profile/${user?.id}`);
                      setProfileOpen(false);
                    }}
                  >
                    <UserCircle size={18} strokeWidth={2} />
                    <span>My Profile</span>
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      navigate('/settings');
                      setProfileOpen(false);
                    }}
                  >
                    <Settings size={18} strokeWidth={2} />
                    <span>Settings</span>
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      navigate('/help');
                      setProfileOpen(false);
                    }}
                  >
                    <HelpCircle size={18} strokeWidth={2} />
                    <span>Help & Support</span>
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-footer">
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={18} strokeWidth={2} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
