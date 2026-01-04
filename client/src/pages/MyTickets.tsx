// src/pages/MyTickets.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/MyTickets.css";
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
  TrendingUp,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { getTickets } from "../../api/tickets";

type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "Technical" | "Security" | "Feature" | "Account" | "Bug";

type ApiTicket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  createdBy?: { _id: string; name: string; email: string; role: string };
  assignee?: { _id: string; name: string; email: string; role: string } | null;
  attachments?: any[];
};

interface TicketUI {
  id: string;
  codeLabel: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assignee?: string;
  createdDate: string;
  lastUpdated: string;
  comments: number;
  attachments: number;
  isFavorite?: boolean;
}

const MyTickets: React.FC = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "priority">("recent");
  const [selectedStatus, setSelectedStatus] = useState<"all" | TicketStatus>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [tickets, setTickets] = useState<ApiTicket[]>([]);

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<Record<TicketPriority, boolean>>({
    low: true,
    medium: true,
    high: true,
    urgent: true,
  });

  const [categoryFilter, setCategoryFilter] = useState<Record<TicketCategory, boolean>>({
    Technical: true,
    Security: true,
    Feature: true,
    Account: true,
    Bug: true,
  });

  // Fetch tickets from API
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
        if (!mounted) return;
        setError(e?.message || e?.response?.data?.message || "Failed to load tickets");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const uiTickets: TicketUI[] = useMemo(() => {
    return tickets.map((t, idx) => {
      const short = String(idx + 1).padStart(4, "0");
      return {
        id: t._id,
        codeLabel: `TKT-${short}`,
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category,
        assignee: t.assignee?.name || undefined,
        createdDate: t.createdAt,
        lastUpdated: t.updatedAt || t.createdAt,
        comments: 0,
        attachments: Array.isArray(t.attachments) ? t.attachments.length : 0,
        isFavorite: false,
      };
    });
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = uiTickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(q) || ticket.codeLabel.toLowerCase().includes(q);
      const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
      const matchesPriority = priorityFilter[ticket.priority as TicketPriority];
      const matchesCategory = categoryFilter[ticket.category as TicketCategory];
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    if (sortBy === "recent") {
      list = list.sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated));
    } else if (sortBy === "oldest") {
      list = list.sort((a, b) => +new Date(a.lastUpdated) - +new Date(b.lastUpdated));
    } else if (sortBy === "priority") {
      const order: Record<TicketPriority, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      list = list.sort(
        (a, b) =>
          order[a.priority as TicketPriority] - order[b.priority as TicketPriority]
      );
    }

    return list;
  }, [uiTickets, searchQuery, selectedStatus, sortBy, priorityFilter, categoryFilter]);

  const getStatusConfig = (status: TicketStatus) => {
    const configs = {
      open: { icon: <AlertCircle size={14} />, class: "status-open", label: "Open" },
      "in-progress": { icon: <Clock size={14} />, class: "status-progress", label: "In Progress" },
      pending: { icon: <Clock size={14} />, class: "status-pending", label: "Pending" },
      resolved: { icon: <CheckCircle size={14} />, class: "status-resolved", label: "Resolved" },
      closed: { icon: <CheckCircle size={14} />, class: "status-closed", label: "Closed" },
    };
    return configs[status];
  };

  const getPriorityClass = (priority: TicketPriority) => {
    const classes = {
      low: "priority-low",
      medium: "priority-medium",
      high: "priority-high",
      urgent: "priority-urgent",
    };
    return classes[priority];
  };

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

  const stats = useMemo(() => {
    const total = uiTickets.length;
    const active = uiTickets.filter((t) => t.status === "in-progress" || t.status === "pending")
      .length;
    const resolved = uiTickets.filter((t) => t.status === "resolved" || t.status === "closed")
      .length;
    const completionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);

    return [
      {
        label: "Total Tickets",
        value: total.toString(),
        icon: <CheckSquare size={24} />,
        onClick: () => {
          setSelectedStatus("all");
          setSearchQuery("");
        },
      },
      {
        label: "Active Tickets",
        value: active.toString(),
        icon: <Clock size={24} />,
        onClick: () => {
          setSelectedStatus("in-progress");
        },
      },
      {
        label: "Assigned To Me",
        value: uiTickets.filter((t) => !!t.assignee).length.toString(),
        icon: <Users size={24} />,
        onClick: () => {
          // Future: filter by current user
        },
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        icon: <TrendingUp size={24} />,
        onClick: () => {
          setSelectedStatus("resolved");
        },
      },
    ];
  }, [uiTickets]);

  const resetFilters = () => {
    setPriorityFilter({ low: true, medium: true, high: true, urgent: true });
    setCategoryFilter({ Technical: true, Security: true, Feature: true, Account: true, Bug: true });
    setSelectedStatus("all");
  };

  const getSortLabel = () => {
    const labels = {
      recent: "Recent",
      oldest: "Oldest",
      priority: "Priority",
    };
    return labels[sortBy];
  };

  const cycleSortBy = () => {
    setSortBy((p) => (p === "recent" ? "priority" : p === "priority" ? "oldest" : "recent"));
  };

  const TicketCard: React.FC<{ ticket: TicketUI }> = ({ ticket }) => {
    const statusConfig = getStatusConfig(ticket.status);

    return (
      <div
        className="ticket-card"
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/tickets/${ticket.id}`)}
      >
        <div className="ticket-card-header">
          <div className="ticket-id-row">
            <span className="ticket-id">{ticket.codeLabel}</span>
            {ticket.isFavorite && <Star size={16} fill="#FFD700" stroke="#FFD700" />}
          </div>
          <button
            className="ticket-menu-btn"
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
          >
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

  const TicketListItem: React.FC<{ ticket: TicketUI }> = ({ ticket }) => {
    const statusConfig = getStatusConfig(ticket.status);

    return (
      <div
        className="ticket-list-item"
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/tickets/${ticket.id}`)}
      >
        <div className="list-item-left">
          {ticket.isFavorite && <Star size={16} fill="#FFD700" stroke="#FFD700" />}
          <span className="ticket-id">{ticket.codeLabel}</span>
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

          <button
            className="ticket-menu-btn"
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div key={index} className="stat-card" onClick={stat.onClick}>
              <div className="stat-left">
                <div className="stat-icon">{stat.icon}</div>
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
                className={`filter-btn ${filterOpen ? "active" : ""}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={18} />
                Filter
              </button>

              <select
                className="sort-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <button className="sort-btn" onClick={cycleSortBy} title={`Current: ${getSortLabel()}`}>
                <ArrowUpDown size={18} />
                {getSortLabel()}
              </button>
            </div>
          </div>

          <div className="controls-right">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            <button className="create-ticket-btn" onClick={() => navigate("/create-ticket")}>
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
              {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => (
                <label key={p} className="filter-option">
                  <input
                    type="checkbox"
                    checked={priorityFilter[p]}
                    onChange={(e) =>
                      setPriorityFilter((prev) => ({ ...prev, [p]: e.target.checked }))
                    }
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Category</h4>
              {(["Technical", "Security", "Feature", "Account", "Bug"] as TicketCategory[]).map(
                (c) => (
                  <label key={c} className="filter-option">
                    <input
                      type="checkbox"
                      checked={categoryFilter[c]}
                      onChange={(e) =>
                        setCategoryFilter((prev) => ({ ...prev, [c]: e.target.checked }))
                      }
                    />
                    <span>{c}</span>
                  </label>
                )
              )}
            </div>

            <div className="filter-actions">
              <button className="filter-reset-btn" onClick={resetFilters}>
                Reset
              </button>
              <button className="filter-apply-btn" onClick={() => setFilterOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Tickets Display */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <RefreshCw size={48} />
            </div>
            <h3>Loading tickets...</h3>
            <p>Please wait while we fetch your tickets</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <XCircle size={64} strokeWidth={1.5} />
            <h3>Failed to load tickets</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        ) : filteredTickets.length > 0 ? (
          <>
            {viewMode === "grid" ? (
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
            <Tag size={64} strokeWidth={1.5} />
            <h3>No tickets found</h3>
            <p>
              {uiTickets.length === 0
                ? "Create your first ticket to get started"
                : "Try adjusting your search or filters"}
            </p>
            {uiTickets.length > 0 && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  resetFilters();
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTickets;
