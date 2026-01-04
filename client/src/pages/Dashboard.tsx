// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/Dashboard.css";

import {
  CheckSquare,
  Clock,
  TrendingUp,
  Info,
  Filter,
  ChevronDown,
  Users,
  Tag,
  Calendar,
} from "lucide-react";

import { getTickets } from "../../api/tickets";

type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "recent" | "team">("overview");
  const [filterOpen, setFilterOpen] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<Record<TicketStatus, boolean>>({
    open: true,
    "in-progress": true,
    pending: true,
    resolved: true,
    closed: false,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getTickets();
        if (!mounted) return;
        setTickets(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Failed to load tickets");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in-progress").length;
    const urgent = tickets.filter((t) => t.priority === "urgent").length;
    return { total, open, inProgress, urgent };
  }, [tickets]);

  const recentTickets = useMemo(() => {
    return tickets
      .filter((t) => statusFilter[t.status])
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [tickets, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate("/tickets")}>
            <div className="stat-header">
              <div className="stat-icon">
                <CheckSquare size={24} />
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{stats.total}</h3>
              <p className="stat-label">Total Tickets</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/tickets?status=open")}>
            <div className="stat-header">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{stats.open}</h3>
              <p className="stat-label">Open</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/tickets?status=in-progress")}>
            <div className="stat-header">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{stats.inProgress}</h3>
              <p className="stat-label">In Progress</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/tickets?priority=urgent")}>
            <div className="stat-header">
              <div className="stat-icon">
                <Info size={24} />
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{stats.urgent}</h3>
              <p className="stat-label">Urgent</p>
            </div>
          </div>
        </div>

        {/* Tabs + Filter */}
        <div className="section-header">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
              {activeTab === "overview" && <ChevronDown size={16} strokeWidth={2.5} />}
            </button>

            <button
              className={`tab ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              Recent Tickets
            </button>

            <button
              className={`tab ${activeTab === "team" ? "active" : ""}`}
              onClick={() => setActiveTab("team")}
            >
              Team
            </button>
          </div>

          {activeTab === "recent" && (
            <div className="section-actions">
              <button
                className={`filter-btn ${filterOpen ? "active" : ""}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={18} strokeWidth={2} />
                Filter
              </button>
            </div>
          )}
        </div>

        {/* Filter panel */}
        {filterOpen && activeTab === "recent" && (
          <div className="filter-panel">
            <div className="filter-section">
              <h4>Status</h4>
              {(["open", "in-progress", "pending", "resolved", "closed"] as TicketStatus[]).map(
                (s) => (
                  <label key={s} className="filter-option">
                    <input
                      type="checkbox"
                      checked={statusFilter[s]}
                      onChange={(e) =>
                        setStatusFilter((p) => ({ ...p, [s]: e.target.checked }))
                      }
                    />
                    <span>{s}</span>
                  </label>
                )
              )}
            </div>

            <div className="filter-actions">
              <button
                className="filter-reset-btn"
                onClick={() =>
                  setStatusFilter({
                    open: true,
                    "in-progress": true,
                    pending: true,
                    resolved: true,
                    closed: false,
                  })
                }
              >
                Reset
              </button>
              <button className="filter-apply-btn" onClick={() => setFilterOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="dashboardState">
            <Clock size={48} strokeWidth={1.5} />
            Loading tickets...
          </div>
        ) : error ? (
          <div className="dashboardState error">
            <Info size={48} strokeWidth={1.5} />
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <section className="dashboard-section">
                <div className="section-title-wrapper">
                  <h2 className="section-title">Quick Actions</h2>
                  <p className="section-subtitle">Fast navigation to key modules</p>
                </div>

                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={() => navigate("/create-ticket")}>
                    <CheckSquare size={28} strokeWidth={2} />
                    <span>Create Ticket</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate("/tickets")}>
                    <CheckSquare size={28} strokeWidth={2} />
                    <span>All Tickets</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate("/user-management")}>
                    <Users size={28} strokeWidth={2} />
                    <span>User Management</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate("/reports")}>
                    <TrendingUp size={28} strokeWidth={2} />
                    <span>Reports</span>
                  </button>
                </div>
              </section>
            )}

            {activeTab === "recent" && (
              <section className="dashboard-section">
                <div className="section-title-wrapper">
                  <h2 className="section-title">Recent Tickets</h2>
                  <p className="section-subtitle">Latest updates based on your filter</p>
                </div>

                {recentTickets.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={64} strokeWidth={1.5} />
                    <h3>No recent tickets</h3>
                    <p>Try adjusting your filters or create a new ticket</p>
                  </div>
                ) : (
                  <div className="dashList">
                    {recentTickets.map((t) => (
                      <button
                        key={t._id}
                        className="dashListItem"
                        onClick={() => navigate(`/tickets/${t._id}`)}
                      >
                        <div className="dashListTop">
                          <span className="dashListTitle">{t.title}</span>
                          <span className={`dashPill status ${t.status}`}>{t.status}</span>
                        </div>
                        <div className="dashListMeta">
                          <span className={`dashPill pri ${t.priority}`}>{t.priority}</span>
                          <span className="dashMuted">
                            <Tag size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                            {t.category}
                          </span>
                          <span className="dashMuted">
                            <Calendar size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                            {formatDate(t.createdAt)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "team" && (
              <section className="dashboard-section">
                <div className="empty-state">
                  <Users size={64} strokeWidth={1.5} />
                  <h3>Team Dashboard</h3>
                  <p>Team widgets will be integrated next (agents, workload, SLA)</p>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
