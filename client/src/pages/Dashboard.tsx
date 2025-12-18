// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import Footer from '../components/Footer';
import '../style/Dashboard.css';
import { 
  HeadphonesIcon,
  VideoIcon,
  CheckSquare,
  ListTodo,
  ChevronDown,
  FolderOpen,
  PieChart,
  FileImage,
  Play,
  FileTextIcon,
  Info,
  Filter,
  MoreVertical,
  TrendingUp,
  Calendar,
  Clock,
  Users
} from 'lucide-react';

interface FolderCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  size?: string;
  hasStatistics?: boolean;
  color?: string;
}

interface DashboardCardProps {
  type: 'overview' | 'chart' | 'video' | 'image' | 'document';
  title: string;
  subtitle?: string;
  isImportant?: boolean;
  isLarge?: boolean;
  metadata?: {
    author?: string;
    date?: string;
  };
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('folders');
  const [filterOpen, setFilterOpen] = useState(false);

  // Folder data
  const folders: FolderCardProps[] = [
    {
      icon: <HeadphonesIcon size={40} strokeWidth={1.5} />,
      title: 'Support',
      count: 1245,
      hasStatistics: true,
      color: '#4CAF50'
    },
    {
      icon: <VideoIcon size={40} strokeWidth={1.5} />,
      title: 'Tutorials',
      count: 1245,
      size: '45 MB',
      color: '#2196F3'
    },
    {
      icon: <CheckSquare size={40} strokeWidth={1.5} />,
      title: 'Tickets',
      count: 1245,
      size: '45 MB',
      color: '#FF9800'
    },
    {
      icon: <ListTodo size={40} strokeWidth={1.5} />,
      title: 'Tasks',
      count: 1245,
      size: '45 MB',
      color: '#9C27B0'
    }
  ];

  // Dashboard cards data
  const dashboardCards: DashboardCardProps[] = [
    {
      type: 'overview',
      title: 'Overview',
      subtitle: 'Welcome aboard! Create your first ticket.',
      isImportant: true,
      isLarge: true
    },
    {
      type: 'chart',
      title: 'Performance',
      subtitle: 'Monthly analytics'
    },
    {
      type: 'video',
      title: 'Weekly',
      subtitle: 'Team meeting recap'
    },
    {
      type: 'image',
      title: 'IMG0010.jpg',
      subtitle: '2.4 MB'
    },
    {
      type: 'image',
      title: 'IMG0011.jpg',
      subtitle: '1.8 MB'
    },
    {
      type: 'video',
      title: 'Training',
      subtitle: 'Onboarding session'
    },
    {
      type: 'document',
      title: 'Weekly plan.docx',
      subtitle: 'Project roadmap',
      metadata: {
        author: 'Design team',
        date: 'Wednesday'
      }
    },
    {
      type: 'image',
      title: 'IMG0012.jpg',
      subtitle: '3.1 MB'
    }
  ];

  // Statistics data
  const stats = [
    { label: 'Total Tickets', value: '2,458', icon: <CheckSquare size={20} />, trend: '+12%', trendUp: true },
    { label: 'Active Tasks', value: '342', icon: <Clock size={20} />, trend: '+8%', trendUp: true },
    { label: 'Team Members', value: '28', icon: <Users size={20} />, trend: '+2', trendUp: true },
    { label: 'Completion Rate', value: '94%', icon: <TrendingUp size={20} />, trend: '+3%', trendUp: true }
  ];

  const FolderCard: React.FC<FolderCardProps> = ({ icon, title, count, size, hasStatistics, color }) => (
    <div className="folder-card">
      <div className="folder-icon" style={{ color: color }}>
        {icon}
      </div>
      <div className="folder-content">
        <h3 className="folder-title">{title}</h3>
        <div className="folder-meta">
          <span className="meta-item">
            <FolderOpen size={14} strokeWidth={2} />
            {count}
          </span>
          {hasStatistics && (
            <span className="meta-item">
              <PieChart size={14} strokeWidth={2} />
              Statistics
            </span>
          )}
          {size && (
            <span className="meta-item">
              💾 {size}
            </span>
          )}
        </div>
      </div>
      <button className="folder-more-btn" aria-label="More options">
        <MoreVertical size={18} strokeWidth={2} />
      </button>
    </div>
  );

  const DashboardCard: React.FC<DashboardCardProps> = ({ 
    type, 
    title, 
    subtitle, 
    isImportant, 
    isLarge,
    metadata 
  }) => {
    const renderThumbnail = () => {
      switch (type) {
        case 'overview':
          return (
            <div className="card-thumbnail overview-thumb">
              <div className="overview-content">
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </div>
            </div>
          );
        case 'chart':
          return (
            <div className="card-thumbnail chart-thumb">
              <PieChart size={48} strokeWidth={1.5} />
              {subtitle && <span className="card-subtitle-overlay">{subtitle}</span>}
            </div>
          );
        case 'video':
          return (
            <div className="card-thumbnail video-thumb">
              <Play size={48} strokeWidth={1.5} fill="currentColor" />
              {subtitle && <span className="card-subtitle-overlay">{subtitle}</span>}
            </div>
          );
        case 'image':
          return (
            <div className="card-thumbnail image-thumb">
              <FileImage size={48} strokeWidth={1.5} />
              {subtitle && <span className="card-size-badge">{subtitle}</span>}
            </div>
          );
        case 'document':
          return (
            <div className="card-thumbnail doc-thumb">
              <div className="doc-content">
                <FileTextIcon size={32} strokeWidth={1.5} className="doc-icon" />
                <h4>{subtitle || title}</h4>
                {metadata?.date && <p className="doc-date">
                  <Calendar size={12} strokeWidth={2} />
                  {metadata.date}
                </p>}
                {metadata?.author && <p className="doc-meta">Author: {metadata.author}</p>}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'chart':
          return <PieChart size={16} strokeWidth={2} />;
        case 'video':
          return <Play size={16} strokeWidth={2} />;
        case 'image':
          return <FileImage size={16} strokeWidth={2} />;
        case 'document':
          return <FileTextIcon size={16} strokeWidth={2} />;
        default:
          return null;
      }
    };

    return (
      <div className={`dashboard-card ${isLarge ? 'large' : ''}`}>
        {renderThumbnail()}
        <div className="card-footer">
          {type === 'overview' && isImportant ? (
            <span className="card-badge important">
              <Info size={14} strokeWidth={2.5} />
              Important
            </span>
          ) : (
            <>
              {getIcon()}
              <span className="card-title">{title}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">{stat.icon}</div>
                <span className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs and Filter */}
        <div className="section-header">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'folders' ? 'active' : ''}`}
              onClick={() => setActiveTab('folders')}
            >
              Folders
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>
            <button 
              className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent
            </button>
            <button 
              className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              Shared
            </button>
          </div>

          <div className="section-actions">
            <button 
              className={`filter-btn ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={18} strokeWidth={2} />
              Filter
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-section">
              <h4>Status</h4>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Active</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Completed</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" />
                <span>Archived</span>
              </label>
            </div>
            <div className="filter-section">
              <h4>Date Range</h4>
              <select className="filter-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
            </div>
            <div className="filter-actions">
              <button className="filter-reset-btn">Reset</button>
              <button className="filter-apply-btn">Apply Filters</button>
            </div>
          </div>
        )}

        {/* Folders Grid */}
        {activeTab === 'folders' && (
          <div className="folders-grid">
            {folders.map((folder, index) => (
              <FolderCard key={index} {...folder} />
            ))}
          </div>
        )}

        {/* Recent Tab Content */}
        {activeTab === 'recent' && (
          <div className="recent-section">
            <p className="empty-state">
              <Clock size={48} strokeWidth={1.5} />
              No recent items to display
            </p>
          </div>
        )}

        {/* Shared Tab Content */}
        {activeTab === 'shared' && (
          <div className="shared-section">
            <p className="empty-state">
              <Users size={48} strokeWidth={1.5} />
              No shared items yet
            </p>
          </div>
        )}

        {/* Dashboard Section */}
        <section className="dashboard-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Dashboard</h2>
            <p className="section-subtitle">Your workspace overview and recent activity</p>
          </div>
          
          <div className="dashboard-grid">
            {dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h3 className="quick-actions-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <CheckSquare size={24} strokeWidth={2} />
              <span>Create Ticket</span>
            </button>
            <button className="quick-action-btn">
              <FileTextIcon size={24} strokeWidth={2} />
              <span>New Document</span>
            </button>
            <button className="quick-action-btn">
              <Users size={24} strokeWidth={2} />
              <span>Invite Team</span>
            </button>
            <button className="quick-action-btn">
              <PieChart size={24} strokeWidth={2} />
              <span>View Reports</span>
            </button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
