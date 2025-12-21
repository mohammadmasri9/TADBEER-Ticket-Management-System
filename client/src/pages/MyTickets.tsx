import React, { useState } from 'react';
import Footer from '../components/Footer';
import '../style/MyTickets.css';
import { 
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  Plus,
  Grid,
  List,
  Star,
  CheckSquare,
  Users,
  TrendingUp
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignee?: string;
  createdDate: string;
  lastUpdated: string;
  comments: number;
  attachments: number;
  isFavorite?: boolean;
}

const MyTickets: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample ticket data
  const allTickets: Ticket[] = [
    {
      id: 'TKT-1001',
      title: 'Login authentication issue on mobile app',
      status: 'in-progress',
      priority: 'high',
      category: 'Technical',
      assignee: 'Sarah Johnson',
      createdDate: '2025-12-15',
      lastUpdated: '2025-12-18',
      comments: 8,
      attachments: 2,
      isFavorite: true
    },
    {
      id: 'TKT-1002',
      title: 'Request for additional user licenses',
      status: 'open',
      priority: 'medium',
      category: 'Account',
      createdDate: '2025-12-17',
      lastUpdated: '2025-12-17',
      comments: 3,
      attachments: 0
    },
    {
      id: 'TKT-1003',
      title: 'Database performance degradation',
      status: 'resolved',
      priority: 'urgent',
      category: 'Technical',
      assignee: 'Mike Chen',
      createdDate: '2025-12-10',
      lastUpdated: '2025-12-16',
      comments: 15,
      attachments: 5,
      isFavorite: true
    },
    {
      id: 'TKT-1004',
      title: 'Feature request: Dark mode support',
      status: 'open',
      priority: 'low',
      category: 'Feature',
      createdDate: '2025-12-14',
      lastUpdated: '2025-12-15',
      comments: 2,
      attachments: 1
    },
    {
      id: 'TKT-1005',
      title: 'Security vulnerability in file upload',
      status: 'in-progress',
      priority: 'urgent',
      category: 'Security',
      assignee: 'Alex Rivera',
      createdDate: '2025-12-16',
      lastUpdated: '2025-12-18',
      comments: 12,
      attachments: 3
    },
    {
      id: 'TKT-1006',
      title: 'Email notification delays',
      status: 'closed',
      priority: 'medium',
      category: 'Technical',
      assignee: 'Emma Davis',
      createdDate: '2025-12-12',
      lastUpdated: '2025-12-14',
      comments: 6,
      attachments: 0
    },
    {
      id: 'TKT-1007',
      title: 'API rate limit exceeded errors',
      status: 'open',
      priority: 'high',
      category: 'Technical',
      createdDate: '2025-12-16',
      lastUpdated: '2025-12-17',
      comments: 4,
      attachments: 1
    },
    {
      id: 'TKT-1008',
      title: 'User profile update not saving',
      status: 'in-progress',
      priority: 'medium',
      category: 'Bug',
      assignee: 'Sarah Johnson',
      createdDate: '2025-12-15',
      lastUpdated: '2025-12-18',
      comments: 5,
      attachments: 0,
      isFavorite: true
    }
  ];

  // Filter tickets based on search and status
  const filteredTickets = allTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status badge styling
  const getStatusConfig = (status: string) => {
    const configs = {
      'open': { icon: <AlertCircle size={14} />, class: 'status-open', label: 'Open' },
      'in-progress': { icon: <Clock size={14} />, class: 'status-progress', label: 'In Progress' },
      'resolved': { icon: <CheckCircle size={14} />, class: 'status-resolved', label: 'Resolved' },
      'closed': { icon: <CheckCircle size={14} />, class: 'status-closed', label: 'Closed' }
    };
    return configs[status as keyof typeof configs];
  };

  // Get priority badge styling
  const getPriorityClass = (priority: string) => {
    const classes = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return classes[priority as keyof typeof classes];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Statistics
  const stats = [
    { 
      label: 'Total Tickets', 
      value: allTickets.length.toString(), 
      icon: <CheckSquare size={24} />,
      trendValue: '+12%',
      trendUp: true
    },
    { 
      label: 'Active Tasks', 
      value: allTickets.filter(t => t.status === 'in-progress').length.toString(), 
      icon: <Clock size={24} />,
      trendValue: '+8%',
      trendUp: true
    },
    { 
      label: 'Team Members', 
      value: '28', 
      icon: <Users size={24} />,
      trendValue: '+2',
      trendUp: true
    },
    { 
      label: 'Completion Rate', 
      value: '94%', 
      icon: <TrendingUp size={24} />,
      trendValue: '+3%',
      trendUp: true
    }
  ];

  // Ticket Card Component
  const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const statusConfig = getStatusConfig(ticket.status);
    
    return (
      <div className="ticket-card">
        <div className="ticket-card-header">
          <div className="ticket-id-row">
            <span className="ticket-id">{ticket.id}</span>
            {ticket.isFavorite && <Star size={16} fill="#FFD700" stroke="#FFD700" />}
          </div>
          <button className="ticket-menu-btn" aria-label="More options">
            <MoreVertical size={18} />
          </button>
        </div>

        <h3 className="ticket-title">{ticket.title}</h3>

        <div className="ticket-badges">
          <span className={`status-badge ${statusConfig.class}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
          <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority}
          </span>
          <span className="category-badge">
            <Tag size={12} />
            {ticket.category}
          </span>
        </div>

        <div className="ticket-meta">
          {ticket.assignee && (
            <div className="meta-item">
              <User size={14} />
              <span>{ticket.assignee}</span>
            </div>
          )}
          <div className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(ticket.lastUpdated)}</span>
          </div>
        </div>

        <div className="ticket-footer">
          <div className="ticket-stats">
            {ticket.comments > 0 && (
              <span className="stat-item">
                <MessageSquare size={14} />
                {ticket.comments}
              </span>
            )}
            {ticket.attachments > 0 && (
              <span className="stat-item">
                <Paperclip size={14} />
                {ticket.attachments}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // List View Item Component
  const TicketListItem: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const statusConfig = getStatusConfig(ticket.status);
    
    return (
      <div className="ticket-list-item">
        <div className="list-item-left">
          {ticket.isFavorite && <Star size={16} fill="#FFD700" stroke="#FFD700" />}
          <span className="ticket-id">{ticket.id}</span>
          <h3 className="ticket-title-list">{ticket.title}</h3>
        </div>

        <div className="list-item-center">
          <span className={`status-badge ${statusConfig.class}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
          <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority}
          </span>
          <span className="category-badge-list">
            <Tag size={12} />
            {ticket.category}
          </span>
        </div>

        <div className="list-item-right">
          {ticket.assignee && (
            <div className="assignee-info">
              <User size={14} />
              <span>{ticket.assignee}</span>
            </div>
          )}
          <div className="ticket-date">
            <Calendar size={14} />
            <span>{formatDate(ticket.lastUpdated)}</span>
          </div>
          <div className="ticket-stats-list">
            {ticket.comments > 0 && (
              <span className="stat-item">
                <MessageSquare size={14} />
                {ticket.comments}
              </span>
            )}
            {ticket.attachments > 0 && (
              <span className="stat-item">
                <Paperclip size={14} />
                {ticket.attachments}
              </span>
            )}
          </div>
          <button className="ticket-menu-btn" aria-label="More options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="my-tickets-page">
      <div className="my-tickets-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-left">
                <div className="stat-icon">{stat.icon}</div>
                <span className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trendValue}
                </span>
              </div>
              <div className="stat-right">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="controls-left">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button 
                className={`filter-btn ${filterOpen ? 'active' : ''}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={18} />
                Filter
              </button>

              <select 
                className="sort-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <button className="sort-btn">
                <ArrowUpDown size={18} />
                Sort
              </button>
            </div>
          </div>

          <div className="controls-right">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            <button className="create-ticket-btn">
              <Plus size={18} />
              New Ticket
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-section">
              <h4>Priority</h4>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Urgent</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>High</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Medium</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Low</span>
              </label>
            </div>

            <div className="filter-section">
              <h4>Category</h4>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Technical</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Feature</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Security</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" defaultChecked />
                <span>Account</span>
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

        {/* Tickets Display */}
        {filteredTickets.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="tickets-grid">
                {filteredTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="tickets-list">
                {filteredTickets.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Tag size={64} strokeWidth={1} />
            <h3>No tickets found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTickets;
