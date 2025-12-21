import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import Footer from '../components/Footer';
import '../style/Profile.css';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Globe,
  Briefcase,
  Award,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  Settings,
  LogOut,
  Key,
  Eye
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'team-lead' | 'team-member';
  department: string;
  position: string;
  location: string;
  joinedDate: string;
  lastActive: string;
  bio: string;
  avatar?: string;
  stats: {
    ticketsCreated: number;
    ticketsResolved: number;
    avgResponseTime: string;
    satisfaction: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'preferences'>('overview');

  // Sample user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: 'USR-001',
    name: 'John Smith',
    email: 'john.smith@tadbeer.com',
    phone: '+972-599-123456',
    role: (user?.role as UserProfile["role"]) || 'team-member',
    department: 'IT Department',
    position: 'Senior System Administrator',
    location: 'Ramallah, Palestine',
    joinedDate: '2024-01-15',
    lastActive: '2025-12-21',
    bio: 'Experienced IT professional with over 5 years in system administration and technical support. Passionate about solving complex technical challenges and improving team efficiency.',
    stats: {
      ticketsCreated: 142,
      ticketsResolved: 128,
      avgResponseTime: '1.8h',
      satisfaction: '4.9'
    }
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  // Handle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  // Handle save
  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Add your API call here to save profile
  };

  // Handle input change
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get role badge config
  const getRoleConfig = (role: string) => {
    const configs = {
      'admin': { icon: <Shield size={16} />, class: 'role-admin', label: 'Administrator' },
      'manager': { icon: <Briefcase size={16} />, class: 'role-manager', label: 'Manager' },
      'team-lead': { icon: <Award size={16} />, class: 'role-lead', label: 'Team Lead' },
      'team-member': { icon: <User size={16} />, class: 'role-member', label: 'Team Member' }
    };
    return configs[role as keyof typeof configs] || configs['team-member'];
  };

  const roleConfig = getRoleConfig(profile.role);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Statistics cards
  const stats = [
    {
      label: 'Tickets Created',
      value: profile.stats.ticketsCreated.toString(),
      icon: <Activity size={24} />,
      color: 'blue'
    },
    {
      label: 'Tickets Resolved',
      value: profile.stats.ticketsResolved.toString(),
      icon: <CheckCircle size={24} />,
      color: 'green'
    },
    {
      label: 'Avg Response Time',
      value: profile.stats.avgResponseTime,
      icon: <Clock size={24} />,
      color: 'orange'
    },
    {
      label: 'Satisfaction Rate',
      value: profile.stats.satisfaction,
      icon: <Award size={24} />,
      color: 'red'
    }
  ];

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="header-background"></div>
          <div className="header-content">
            <div className="avatar-section">
              <div className="avatar-container">
                <div className="avatar">
                  <User size={64} />
                </div>
                {isEditing && (
                  <button className="avatar-upload-btn" aria-label="Upload photo">
                    <Camera size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="profile-info">
              <div className="info-main">
                {isEditing ? (
                  <input
                    type="text"
                    className="edit-input name-input"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <h1 className="profile-name">{profile.name}</h1>
                )}
                <div className="profile-badges">
                  <span className={`role-badge ${roleConfig.class}`}>
                    {roleConfig.icon}
                    {roleConfig.label}
                  </span>
                  <span className="status-badge active">
                    <CheckCircle size={14} />
                    Active
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button className="action-btn save-btn" onClick={handleSave}>
                      <Save size={18} />
                      Save Changes
                    </button>
                    <button className="action-btn cancel-btn" onClick={handleEditToggle}>
                      <X size={18} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="action-btn edit-btn" onClick={handleEditToggle}>
                    <Edit size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={18} />
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Settings size={18} />
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="tabs-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <div className="content-grid">
                {/* Personal Information */}
                <div className="info-card">
                  <div className="card-header">
                    <h3 className="card-title">Personal Information</h3>
                    <User size={20} className="card-icon" />
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <div className="info-label">
                        <Mail size={16} />
                        <span>Email</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="email"
                          className="edit-input"
                          value={editedProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      ) : (
                        <div className="info-value">{profile.email}</div>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Phone size={16} />
                        <span>Phone</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="edit-input"
                          value={editedProfile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      ) : (
                        <div className="info-value">{profile.phone}</div>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <MapPin size={16} />
                        <span>Location</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={editedProfile.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                        />
                      ) : (
                        <div className="info-value">{profile.location}</div>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Calendar size={16} />
                        <span>Joined</span>
                      </div>
                      <div className="info-value">{formatDate(profile.joinedDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="info-card">
                  <div className="card-header">
                    <h3 className="card-title">Work Information</h3>
                    <Briefcase size={20} className="card-icon" />
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <div className="info-label">
                        <Briefcase size={16} />
                        <span>Position</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={editedProfile.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                        />
                      ) : (
                        <div className="info-value">{profile.position}</div>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Shield size={16} />
                        <span>Department</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-input"
                          value={editedProfile.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                        />
                      ) : (
                        <div className="info-value">{profile.department}</div>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Award size={16} />
                        <span>Role</span>
                      </div>
                      <div className="info-value">
                        <span className={`role-badge-small ${roleConfig.class}`}>
                          {roleConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <Activity size={16} />
                        <span>Last Active</span>
                      </div>
                      <div className="info-value">{formatDate(profile.lastActive)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="info-card bio-card">
                <div className="card-header">
                  <h3 className="card-title">About Me</h3>
                  <User size={20} className="card-icon" />
                </div>
                <div className="card-content">
                  {isEditing ? (
                    <textarea
                      className="edit-textarea"
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p className="bio-text">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-panel">
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">Password & Security</h3>
                  <Lock size={20} className="card-icon" />
                </div>
                <div className="card-content">
                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-icon">
                        <Key size={20} />
                      </div>
                      <div className="security-details">
                        <h4 className="security-title">Password</h4>
                        <p className="security-description">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="security-btn">
                      <Edit size={16} />
                      Change
                    </button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-icon">
                        <Shield size={20} />
                      </div>
                      <div className="security-details">
                        <h4 className="security-title">Two-Factor Authentication</h4>
                        <p className="security-description">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="security-btn">
                      <Settings size={16} />
                      Enable
                    </button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-icon">
                        <Activity size={20} />
                      </div>
                      <div className="security-details">
                        <h4 className="security-title">Active Sessions</h4>
                        <p className="security-description">Manage your active sessions</p>
                      </div>
                    </div>
                    <button className="security-btn">
                      <Eye size={16} />
                      View
                    </button>
                  </div>

                  <div className="security-item danger">
                    <div className="security-info">
                      <div className="security-icon">
                        <AlertCircle size={20} />
                      </div>
                      <div className="security-details">
                        <h4 className="security-title">Delete Account</h4>
                        <p className="security-description">Permanently delete your account</p>
                      </div>
                    </div>
                    <button className="security-btn danger-btn">
                      <X size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="tab-panel">
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">Notification Preferences</h3>
                  <Bell size={20} className="card-icon" />
                </div>
                <div className="card-content">
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Email Notifications</h4>
                      <p className="preference-description">Receive email updates about your tickets</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Push Notifications</h4>
                      <p className="preference-description">Receive push notifications on your device</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Weekly Summary</h4>
                      <p className="preference-description">Get a weekly summary of your activity</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">Display Preferences</h3>
                  <Settings size={20} className="card-icon" />
                </div>
                <div className="card-content">
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Language</h4>
                      <p className="preference-description">Choose your preferred language</p>
                    </div>
                    <select className="preference-select">
                      <option>English</option>
                      <option>العربية</option>
                      
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Timezone</h4>
                      <p className="preference-description">Set your local timezone</p>
                    </div>
                    <select className="preference-select">
                      <option>Asia/Jerusalem (GMT+2)</option>
                      <option>Europe/London (GMT+0)</option>
                      <option>America/New_York (GMT-5)</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4 className="preference-title">Date Format</h4>
                      <p className="preference-description">Choose how dates are displayed</p>
                    </div>
                    <select className="preference-select">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="logout-section">
          <button className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
