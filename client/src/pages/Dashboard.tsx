// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  ClipboardList,
  UserCheck,
  Eye,
  Repeat,
  X,
} from "lucide-react";

import { getTickets, TicketDTO } from "../../api/tickets";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import "../style/Dashboard.css";

type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
type TicketScope = "created" | "assigned" | "watching" | "reassigned";
type DashboardTab = "overview" | "recent" | "team";

interface StatusFilter {
  open: boolean;
  "in-progress": boolean;
  pending: boolean;
  resolved: boolean;
  closed: boolean;
}

interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  urgent: number;
}

/* =========================
   UTILS
========================= */
const normalizeId = (val: any): string => {
  if (!val) return "";
  const fromObj =
    val?._id ?? val?.id ?? val?.userId ?? val?.uid ?? val?.value ?? val?.user?._id;
  const raw = fromObj ?? val;

  try {
    return raw?.toString?.() ? String(raw.toString()) : String(raw);
  } catch {
    return "";
  }
};

const isSameId = (a: any, b: any): boolean => {
  const A = normalizeId(a);
  const B = normalizeId(b);
  return !!A && !!B && A === B;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* =========================
   COMPONENTS
========================= */
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  onClick: () => void;
}
const StatCard: React.FC<StatCardProps> = ({ icon, value, label, onClick }) => (
  <div className="stat-card" onClick={onClick} role="button" tabIndex={0}>
    <div className="stat-header">
      <div className="stat-icon">{icon}</div>
    </div>
    <div className="stat-body">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

interface TicketListItemProps {
  ticket: TicketDTO;
  onClick: () => void;
}
const TicketListItem: React.FC<TicketListItemProps> = ({ ticket, onClick }) => (
  <button className="dashListItem" onClick={onClick} type="button">
    <div className="dashListTop">
      <span className="dashListTitle">{ticket.title}</span>
      <span className={`dashPill status ${ticket.status}`}>{ticket.status}</span>
    </div>
    <div className="dashListMeta">
      <span className={`dashPill pri ${ticket.priority}`}>{ticket.priority}</span>
      <span className="dashMuted">
        <Tag size={14} aria-hidden="true" />
        {ticket.category}
      </span>
      <span className="dashMuted">
        <Calendar size={14} aria-hidden="true" />
        {formatDate(ticket.createdAt)}
      </span>
    </div>
  </button>
);

interface ScopeSelectorProps {
  scope: TicketScope;
  onScopeChange: (scope: TicketScope) => void;
  isManager: boolean;
}
const ScopeSelector: React.FC<ScopeSelectorProps> = ({ scope, onScopeChange, isManager }) => {
  const scopes: Array<{ value: TicketScope; label: string; icon: React.ReactNode; show?: boolean }> =
    [
      { value: "created", label: "Created by Me", icon: <ClipboardList size={16} />, show: true },
      { value: "assigned", label: "Assigned to Me", icon: <UserCheck size={16} />, show: true },
      { value: "watching", label: "Watching", icon: <Eye size={16} />, show: true },

      // ✅ only managers should see this
      {
        value: "reassigned",
        label: "Reassigned by Me",
        icon: <Repeat size={16} />,
        show: isManager,
      },
    ];

  return (
    <div className="scope-selector">
      {scopes
        .filter((s) => s.show)
        .map(({ value, label, icon }) => (
          <button
            key={value}
            className={`scope-btn ${scope === value ? "active" : ""}`}
            onClick={() => onScopeChange(value)}
            aria-pressed={scope === value}
            type="button"
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
    </div>
  );
};

interface FilterPanelProps {
  statusFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  onClose: () => void;
  onReset: () => void;
}
const FilterPanel: React.FC<FilterPanelProps> = ({
  statusFilter,
  onFilterChange,
  onClose,
  onReset,
}) => {
  const statuses: TicketStatus[] = ["open", "in-progress", "pending", "resolved", "closed"];

  const handleCheckboxChange = (status: TicketStatus, checked: boolean) => {
    onFilterChange({ ...statusFilter, [status]: checked });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h4>Filter Tickets</h4>
        <button className="filter-close" onClick={onClose} aria-label="Close filter" type="button">
          <X size={18} />
        </button>
      </div>

      <div className="filter-section">
        <h5>Status</h5>
        {statuses.map((status) => (
          <label key={status} className="filter-option">
            <input
              type="checkbox"
              checked={statusFilter[status]}
              onChange={(e) => handleCheckboxChange(status, e.target.checked)}
            />
            <span>{status.replace("-", " ")}</span>
          </label>
        ))}
      </div>

      <div className="filter-actions">
        <button className="filter-reset-btn" onClick={onReset} type="button">
          Reset
        </button>
        <button className="filter-apply-btn" onClick={onClose} type="button">
          Apply
        </button>
      </div>
    </div>
  );
};

/* =========================
   MAIN
========================= */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ keep it TS-safe
  const u: any = user as any;

  const myId = useMemo(() => normalizeId(u?.userId ?? u?.id ?? u?._id ?? u?.uid), [u]);
  const myRole = useMemo(() => String(u?.role || ""), [u]);
  const isManager = useMemo(() => myRole === "manager", [myRole]);

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [scope, setScope] = useState<TicketScope>("created");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>({
    open: true,
    "in-progress": true,
    pending: true,
    resolved: true,
    closed: false,
  });

  const scopeLabel = useMemo(() => {
    const labels: Record<TicketScope, string> = {
      created: "Created by Me",
      assigned: "Assigned to Me",
      watching: "Watching",
      reassigned: "Reassigned by Me",
    };
    return labels[scope];
  }, [scope]);

  /**
   * ✅ scopedTickets
   * - created/assigned/watching uses backend view
   * - reassigned is frontend-only filter (based on watchers.addedBy)
   */
  const scopedTickets = useMemo(() => {
    if (!myId) return [];

    if (scope === "reassigned") {
      // tickets where I (manager) added watchers entries (usually when assigning/reassigning)
      return tickets.filter((t: any) => {
        const watchers = (t.watchers || []) as any[];

        // ✅ "addedBy" exists in your schema when adding watchers
        // ticket qualifies if any watcher was added by me
        const addedByMe = watchers.some((w) => isSameId(w?.addedBy, myId));

        // optional: do not count tickets where the watcher is me
        // (you can remove this if you want to also include self-watching)
        const watcherIsMe = watchers.some((w) => isSameId(w?.userId ?? w, myId));

        return addedByMe && !watcherIsMe;
      });
    }

    // fallback safety filters (even though backend view returns correct list)
    if (scope === "created") return tickets.filter((t: any) => isSameId(t.createdBy, myId));
    if (scope === "assigned") return tickets.filter((t: any) => isSameId(t.assignee, myId));
    if (scope === "watching")
      return tickets.filter((t: any) => {
        const watchers = (t.watchers || []) as any[];
        return watchers.some((w) => isSameId(w?.userId ?? w, myId));
      });

    return tickets;
  }, [tickets, scope, myId]);

  const stats = useMemo<DashboardStats>(() => {
    return {
      total: scopedTickets.length,
      open: scopedTickets.filter((t) => t.status === "open").length,
      inProgress: scopedTickets.filter((t) => t.status === "in-progress").length,
      urgent: scopedTickets.filter((t) => t.priority === "urgent").length,
    };
  }, [scopedTickets]);

  const recentTickets = useMemo(() => {
    return scopedTickets
      .filter((t) => statusFilter[t.status as TicketStatus])
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [scopedTickets, statusFilter]);

  /**
   * ✅ Fetch tickets:
   * - for reassigned: fetch a broad set so we can filter locally.
   *   easiest: manager already gets dept tickets by default.
   * - for other scopes: backend view.
   */
  useEffect(() => {
    let mounted = true;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          scope === "reassigned"
            ? undefined // manager default scope = department tickets
            : { view: scope };

        const data = await getTickets(params as any);

        if (!mounted) return;
        setTickets(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Failed to load tickets");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTickets();

    return () => {
      mounted = false;
    };
  }, [scope]);

  const handleFilterReset = useCallback(() => {
    setStatusFilter({
      open: true,
      "in-progress": true,
      pending: true,
      resolved: true,
      closed: false,
    });
  }, []);

  const handleRetry = () => window.location.reload();

  // ✅ if not manager and user somehow is on "reassigned", fallback to created
  useEffect(() => {
    if (!isManager && scope === "reassigned") setScope("created");
  }, [isManager, scope]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <ScopeSelector scope={scope} onScopeChange={setScope} isManager={isManager} />
          <div className="current-view">
            <span className="view-label">Current View:</span>
            <span className="view-value">{scopeLabel}</span>
          </div>
        </div>

        <section className="stats-section" aria-label="Ticket statistics">
          <div className="stats-grid">
            <StatCard
              icon={<CheckSquare size={24} />}
              value={stats.total}
              label={scopeLabel}
              onClick={() => navigate("/tickets")}
            />
            <StatCard
              icon={<Clock size={24} />}
              value={stats.open}
              label="Open"
              onClick={() => navigate("/tickets?status=open")}
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              value={stats.inProgress}
              label="In Progress"
              onClick={() => navigate("/tickets?status=in-progress")}
            />
            <StatCard
              icon={<Info size={24} />}
              value={stats.urgent}
              label="Urgent"
              onClick={() => navigate("/tickets?priority=urgent")}
            />
          </div>
        </section>

        <div className="section-header">
          <div className="tabs" role="tablist">
            <button
              className={`tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              type="button"
            >
              Overview
              {activeTab === "overview" && <ChevronDown size={16} strokeWidth={2.5} />}
            </button>

            <button
              className={`tab ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
              type="button"
            >
              Recent ({scopeLabel})
            </button>

            <button
              className={`tab ${activeTab === "team" ? "active" : ""}`}
              onClick={() => setActiveTab("team")}
              type="button"
            >
              Team
            </button>
          </div>

          {activeTab === "recent" && (
            <div className="section-actions">
              <button
                className={`filter-btn ${filterOpen ? "active" : ""}`}
                onClick={() => setFilterOpen(!filterOpen)}
                type="button"
              >
                <Filter size={18} strokeWidth={2} />
                Filter
              </button>
            </div>
          )}
        </div>

        {filterOpen && activeTab === "recent" && (
          <FilterPanel
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            onClose={() => setFilterOpen(false)}
            onReset={handleFilterReset}
          />
        )}

        {loading ? (
          <div className="dashboardState" role="status" aria-live="polite">
            <Clock size={48} strokeWidth={1.5} />
            <span>Loading tickets...</span>
          </div>
        ) : error ? (
          <div className="dashboardState error" role="alert">
            <Info size={48} strokeWidth={1.5} />
            <span>{error}</span>
            <button onClick={handleRetry} type="button">
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <section className="dashboard-section" aria-labelledby="overview-title">
                <div className="section-title-wrapper">
                  <h2 id="overview-title" className="section-title">
                    Quick Actions
                  </h2>
                  <p className="section-subtitle">Fast navigation to key modules</p>
                </div>

                <div className="quick-actions-grid">
                  <button
                    className="quick-action-btn"
                    onClick={() => navigate("/create-ticket")}
                    type="button"
                  >
                    <CheckSquare size={28} strokeWidth={2} />
                    <span>Create Ticket</span>
                  </button>

                  <button className="quick-action-btn" onClick={() => navigate("/tickets")} type="button">
                    <CheckSquare size={28} strokeWidth={2} />
                    <span>All Tickets</span>
                  </button>

                  <button
                    className="quick-action-btn"
                    onClick={() => navigate("/user-management")}
                    type="button"
                  >
                    <Users size={28} strokeWidth={2} />
                    <span>User Management</span>
                  </button>

                  <button className="quick-action-btn" onClick={() => navigate("/reports")} type="button">
                    <TrendingUp size={28} strokeWidth={2} />
                    <span>Reports</span>
                  </button>
                </div>
              </section>
            )}

            {activeTab === "recent" && (
              <section className="dashboard-section" aria-labelledby="recent-title">
                <div className="section-title-wrapper">
                  <h2 id="recent-title" className="section-title">
                    Recent Tickets — {scopeLabel}
                  </h2>
                  <p className="section-subtitle">Latest updates in this view</p>
                </div>

                {recentTickets.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={64} strokeWidth={1.5} />
                    <h3>No tickets in this view</h3>
                    <p>Try switching views or create/assign/watch a ticket</p>
                  </div>
                ) : (
                  <div className="dashList">
                    {recentTickets.map((ticket: any) => (
                      <TicketListItem
                        key={ticket._id}
                        ticket={ticket}
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "team" && (
              <section className="dashboard-section" aria-labelledby="team-title">
                <div className="empty-state">
                  <Users size={64} strokeWidth={1.5} />
                  <h3 id="team-title">Team Dashboard</h3>
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
