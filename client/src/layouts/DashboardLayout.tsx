// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import '../style/DashboardLayout.css';
import { 
  ChevronRight,
  FileText,
  CheckSquare,
  Clock,
  CheckCircle,
  FolderOpen,
  Archive,
  RotateCcw,
  Star,
  Trash2,
  Users,
  GraduationCap
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const ticketNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <ChevronRight size={16} />, path: '/overview' },
    { id: 'active', label: 'Active tickets', icon: <FileText size={16} />, path: '/active-tickets' },
    { id: 'pending', label: 'Pending tasks', icon: <Clock size={16} />, path: '/pending-tasks' },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} />, path: '/completed' },
    { id: 'team', label: 'Team projects', icon: <FolderOpen size={16} />, path: '/team-projects' },
    { id: 'archived', label: 'Archived tickets', icon: <Archive size={16} />, path: '/archived' },
    { id: 'recent', label: 'Recent updates', icon: <RotateCcw size={16} />, path: '/recent-updates' },
    { id: 'favorites', label: 'Favorites', icon: <Star size={16} />, path: '/favorites' },
    { id: 'recycle', label: 'Recycle bin', icon: <Trash2 size={16} />, path: '/recycle-bin' },
  ];

  const sharedItems: NavItem[] = [
    { id: 'team', label: 'Team', icon: <Users size={16} />, path: '/shared/team' },
    { id: 'training', label: 'Training', icon: <GraduationCap size={16} />, path: '/shared/training' },
  ];

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar - works on ALL screen sizes
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('completed')) return 'Completed Tickets';
    if (path.includes('active')) return 'Active Tickets';
    if (path.includes('pending')) return 'Pending Tasks';
    if (path.includes('overview')) return 'Overview';
    if (path.includes('team-projects')) return 'Team Projects';
    if (path.includes('archived')) return 'Archived Tickets';
    if (path.includes('recent')) return 'Recent Updates';
    if (path.includes('favorites')) return 'Favorites';
    if (path.includes('recycle')) return 'Recycle Bin';
    return 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      {/* Header - Fixed at top */}
      <Header 
        title={getPageTitle()}
        showSearch={true}
        onMenuToggle={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Ticket Management Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Ticket management</h3>
          
          <nav className="sidebar-nav">
            {ticketNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Shared Tickets Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Shared tickets</h3>
          
          <nav className="sidebar-nav">
            {sharedItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <ChevronRight size={16} className="nav-icon" />
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="btn-create-ticket">Create ticket</button>
          
         </div>
      </aside>

      {/* Overlay for mobile - only visible when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay visible" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
