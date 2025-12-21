import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import Footer from '../components/Footer';
import '../style/Reports.css';
import { 
  Calendar,
  Download,
  FileText,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Users,
  Ticket,
  AlertCircle,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-12-21');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Role-based access check
  if (user?.role !== "manager") {
    return (
      <div className="reports-page">
        <div className="reports-content">
          <div className="access-denied-container">
            <div className="access-denied-card">
              <div className="access-denied-icon">
                <Lock size={64} />
              </div>
              <h2 className="access-denied-title">Access Restricted</h2>
              <p className="access-denied-message">
                You don't have permission to access this page. Reports dashboard is only available for managers.
              </p>
              <div className="access-denied-info">
                <p className="info-label">Your Current Role:</p>
                <span className="role-badge">{user?.role || 'Guest'}</span>
              </div>
              <button 
                className="back-btn"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Ticket Metrics Data (Bar Chart)
  const ticketMetrics: ChartData[] = [
    { label: 'Mon', value: 85 },
    { label: 'Tue', value: 62 },
    { label: 'Wed', value: 78 },
    { label: 'Thu', value: 92 },
    { label: 'Fri', value: 71 },
    { label: 'Sat', value: 105 },
    { label: 'Sun', value: 58 },
    { label: 'Mon', value: 95 }
  ];

  // Performance Indicators Data (Pie Chart)
  const performanceIndicators: ChartData[] = [
    { label: 'Resolved', value: 156, percentage: 45 },
    { label: 'In Progress', value: 89, percentage: 26 },
    { label: 'Open', value: 52, percentage: 15 },
    { label: 'On Hold', value: 28, percentage: 8 },
    { label: 'Closed', value: 21, percentage: 6 }
  ];

  // Statistics Cards
  const stats = [
    {
      label: 'Total Tickets',
      value: '346',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Ticket size={24} />
    },
    {
      label: 'Avg Response Time',
      value: '2.4h',
      change: '-8.3%',
      trend: 'down' as const,
      icon: <Clock size={24} />
    },
    {
      label: 'Resolution Rate',
      value: '94.2%',
      change: '+5.1%',
      trend: 'up' as const,
      icon: <CheckCircle size={24} />
    },
    {
      label: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.3',
      trend: 'up' as const,
      icon: <TrendingUp size={24} />
    }
  ];

  // Team Performance Data
  const teamPerformance = [
    { team: 'Technical Support', tickets: 142, resolved: 128, avgTime: '1.8h', satisfaction: '4.9' },
    { team: 'Customer Service', tickets: 98, resolved: 89, avgTime: '2.1h', satisfaction: '4.7' },
    { team: 'IT Department', tickets: 76, resolved: 71, avgTime: '3.2h', satisfaction: '4.6' },
    { team: 'Security Team', tickets: 30, resolved: 28, avgTime: '2.5h', satisfaction: '4.8' }
  ];

  // Get max value for bar chart scaling
  const maxTicketValue = Math.max(...ticketMetrics.map(m => m.value));

  // Handle report generation
  const handleGenerateReport = () => {
    console.log('Generating report with:', { startDate, endDate, selectedStatus, selectedTeam });
    // Add your report generation logic here
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    console.log('Downloading PDF report...');
    // Add PDF download logic here
  };

  // Handle Excel download
  const handleDownloadExcel = () => {
    console.log('Downloading Excel report...');
    // Add Excel download logic here
  };

  return (
    <div className="reports-page">
      <div className="reports-content">
        {/* Page Header */}
        <div className="reports-header">
          <div className="header-left">
            <h1 className="page-title">Reports Dashboard</h1>
            <p className="page-subtitle">Comprehensive analytics and performance metrics</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <div className="filter-item">
              <label htmlFor="start-date">Date Range</label>
              <input
                id="start-date"
                type="date"
                className="date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="end-date">&nbsp;</label>
              <input
                id="end-date"
                type="date"
                className="date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="team-filter">Team Performance</label>
              <select
                id="team-filter"
                className="filter-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="all">All Teams</option>
                <option value="technical">Technical Support</option>
                <option value="customer">Customer Service</option>
                <option value="it">IT Department</option>
                <option value="security">Security Team</option>
              </select>
            </div>
          </div>

          <button className="generate-report-btn" onClick={handleGenerateReport}>
            <BarChart3 size={18} />
            Generate Report
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Ticket Metrics Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Ticket Metrics</h3>
              <BarChart3 size={20} className="chart-icon" />
            </div>
            <div className="chart-content">
              <div className="bar-chart">
                {ticketMetrics.map((metric, index) => (
                  <div key={index} className="bar-container">
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{
                          height: `${(metric.value / maxTicketValue) * 100}%`
                        }}
                      >
                        <div className="bar-fill"></div>
                      </div>
                    </div>
                    <span className="bar-label">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Indicators Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Performance Indicators</h3>
              <PieChart size={20} className="chart-icon" />
            </div>
            <div className="chart-content">
              <div className="pie-chart-wrapper">
                <svg viewBox="0 0 200 200" className="pie-chart">
                  {(() => {
                    let currentAngle = 0;
                    return performanceIndicators.map((indicator, index) => {
                      const colors = ['#1a1a1a', '#2d2d2d', '#404040', '#595959', '#737373'];
                      const percentage = indicator.percentage || 0;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      
                      currentAngle = endAngle;

                      const startX = 100 + 90 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const startY = 100 + 90 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const endX = 100 + 90 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const endY = 100 + 90 * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M 100 100`,
                        `L ${startX} ${startY}`,
                        `A 90 90 0 ${largeArc} 1 ${endX} ${endY}`,
                        `Z`
                      ].join(' ');

                      return (
                        <path
                          key={index}
                          d={pathData}
                          fill={colors[index]}
                          className="pie-slice"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="pie-legend">
                  {performanceIndicators.map((indicator, index) => (
                    <div key={index} className="legend-item">
                      <div
                        className="legend-color"
                        style={{
                          backgroundColor: ['#1a1a1a', '#2d2d2d', '#404040', '#595959', '#737373'][index]
                        }}
                      ></div>
                      <span className="legend-label">{indicator.label}</span>
                      <span className="legend-value">{indicator.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Team Performance Overview</h3>
            <Users size={20} className="table-icon" />
          </div>
          <div className="table-wrapper">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Total Tickets</th>
                  <th>Resolved</th>
                  <th>Avg Response Time</th>
                  <th>Satisfaction</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((team, index) => {
                  const resolveRate = ((team.resolved / team.tickets) * 100).toFixed(1);
                  return (
                    <tr key={index}>
                      <td className="team-name">{team.team}</td>
                      <td>{team.tickets}</td>
                      <td>{team.resolved}</td>
                      <td>{team.avgTime}</td>
                      <td>
                        <div className="satisfaction-cell">
                          <span className="satisfaction-value">{team.satisfaction}</span>
                          <div className="satisfaction-stars">★★★★★</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${parseFloat(resolveRate) >= 90 ? 'excellent' : parseFloat(resolveRate) >= 80 ? 'good' : 'needs-improvement'}`}>
                          {parseFloat(resolveRate) >= 90 ? 'Excellent' : parseFloat(resolveRate) >= 80 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Downloadable Reports Section */}
        <div className="download-section">
          <div className="download-header">
            <h3 className="download-title">Downloadable Reports</h3>
            <FileText size={20} className="download-icon" />
          </div>
          <div className="download-actions">
            <button className="download-btn pdf-btn" onClick={handleDownloadPDF}>
              <Download size={18} />
              Download PDF
            </button>
            <button className="download-btn excel-btn" onClick={handleDownloadExcel}>
              <FileSpreadsheet size={18} />
              Download Excel
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reports;
