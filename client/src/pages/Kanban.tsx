// src/pages/Kanban.tsx
import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../style/Kanban.css";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  Users,
  MessageSquare,
  Paperclip,
  GripVertical,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: { name: string; avatar?: string };
  dueDate: string;
  tags: string[];
  comments: number;
  attachments: number;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
}

/* Sortable Card */
const SortableTicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ticket.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  const priorityClass: Record<Ticket["priority"], string> = {
    urgent: "priority-urgent",
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  const priorityLabel = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);

  return (
    <div ref={setNodeRef} style={style} className={`ticket-card ${isDragging ? "dragging" : ""}`}>
      <div className="drag-handle" {...attributes} {...listeners} aria-label="Drag ticket">
        <GripVertical size={16} />
      </div>

      <div className="ticket-header">
        <span className={`priority-badge ${priorityClass[ticket.priority]}`}>{priorityLabel}</span>
        <button className="ticket-menu-btn" type="button" aria-label="Ticket menu">
          <MoreVertical size={16} />
        </button>
      </div>

      <h4 className="ticket-title">{ticket.title}</h4>
      <p className="ticket-description">{ticket.description}</p>

      {ticket.tags.length > 0 && (
        <div className="ticket-tags">
          {ticket.tags.map((tag, idx) => (
            <span key={idx} className="ticket-tag">
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="ticket-footer">
        <div className="ticket-assignee">
          <div className="assignee-avatar">
            <User size={14} />
          </div>
          <span className="assignee-name">{ticket.assignee.name}</span>
        </div>

        <div className="ticket-meta">
          {ticket.comments > 0 && (
            <div className="meta-item" title="Comments">
              <MessageSquare size={14} />
              <span>{ticket.comments}</span>
            </div>
          )}
          {ticket.attachments > 0 && (
            <div className="meta-item" title="Attachments">
              <Paperclip size={14} />
              <span>{ticket.attachments}</span>
            </div>
          )}
          <div className="meta-item" title="Due date">
            <Calendar size={14} />
            <span>
              {new Date(ticket.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Kanban: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const columns: Column[] = useMemo(
    () => [
      { id: "backlog", title: "Backlog", color: "#6B7280", icon: <AlertCircle size={18} /> },
      { id: "todo", title: "To Do", color: "#3B82F6", icon: <Clock size={18} /> },
      { id: "inProgress", title: "In Progress", color: "#F59E0B", icon: <Loader size={18} /> },
      { id: "review", title: "Review", color: "#8B5CF6", icon: <Users size={18} /> },
      { id: "done", title: "Done", color: "#10B981", icon: <CheckCircle size={18} /> },
    ],
    []
  );

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "ticket-1",
      title: "Login page not responsive on mobile",
      description: "Users are reporting issues with the login page on mobile devices",
      priority: "medium",
      assignee: { name: "Ahmad Hassan" },
      dueDate: "2025-12-25",
      tags: ["UI", "Mobile"],
      comments: 3,
      attachments: 1,
      columnId: "backlog",
    },
    {
      id: "ticket-2",
      title: "Add dark mode support",
      description: "Implement dark mode theme across the application",
      priority: "low",
      assignee: { name: "Sara Ali" },
      dueDate: "2025-12-30",
      tags: ["Enhancement", "UI"],
      comments: 5,
      attachments: 0,
      columnId: "backlog",
    },
    {
      id: "ticket-3",
      title: "Database backup automation",
      description: "Set up automated daily database backups",
      priority: "high",
      assignee: { name: "Mohammed Khalil" },
      dueDate: "2025-12-22",
      tags: ["Backend", "Database"],
      comments: 2,
      attachments: 2,
      columnId: "todo",
    },
    {
      id: "ticket-4",
      title: "API rate limiting",
      description: "Implement rate limiting for public API endpoints",
      priority: "urgent",
      assignee: { name: "Omar Nasser" },
      dueDate: "2025-12-21",
      tags: ["Security", "API"],
      comments: 7,
      attachments: 3,
      columnId: "todo",
    },
    {
      id: "ticket-5",
      title: "User profile page redesign",
      description: "Redesign user profile page with new components",
      priority: "medium",
      assignee: { name: "Layla Ibrahim" },
      dueDate: "2025-12-23",
      tags: ["UI", "Design"],
      comments: 8,
      attachments: 5,
      columnId: "inProgress",
    },
    {
      id: "ticket-6",
      title: "Email notification system",
      description: "Implement email notifications for ticket updates",
      priority: "high",
      assignee: { name: "Fatima Yousef" },
      dueDate: "2025-12-24",
      tags: ["Feature", "Backend"],
      comments: 4,
      attachments: 1,
      columnId: "review",
    },
    {
      id: "ticket-7",
      title: "Password reset functionality",
      description: "Add password reset via email",
      priority: "high",
      assignee: { name: "Youssef Ahmed" },
      dueDate: "2025-12-20",
      tags: ["Security", "Feature"],
      comments: 6,
      attachments: 2,
      columnId: "done",
    },
    {
      id: "ticket-8",
      title: "Update footer links",
      description: "Update all footer links with correct URLs",
      priority: "low",
      assignee: { name: "Nour Hassan" },
      dueDate: "2025-12-19",
      tags: ["UI", "Content"],
      comments: 1,
      attachments: 0,
      columnId: "done",
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filterTicket = (t: Ticket, q: string) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      t.title.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.assignee.name.toLowerCase().includes(s) ||
      t.tags.join(" ").toLowerCase().includes(s)
    );
  };

  const getTicketsByColumn = (columnId: string) => {
    const q = searchQuery.trim();
    return tickets.filter((t) => t.columnId === columnId).filter((t) => filterTicket(t, q));
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTicketId = active.id as string;
    const overId = over.id as string;

    const activeTicket = tickets.find((t) => t.id === activeTicketId);
    if (!activeTicket) return;

    const overColumn = columns.find((c) => c.id === overId);
    const overTicket = tickets.find((t) => t.id === overId);

    if (overColumn) {
      if (activeTicket.columnId !== overColumn.id) {
        setTickets((prev) =>
          prev.map((t) => (t.id === activeTicketId ? { ...t, columnId: overColumn.id } : t))
        );
      }
      return;
    }

    if (overTicket && activeTicket.columnId !== overTicket.columnId) {
      setTickets((prev) =>
        prev.map((t) => (t.id === activeTicketId ? { ...t, columnId: overTicket.columnId } : t))
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTicketId = active.id as string;
    const overId = over.id as string;

    const activeTicket = tickets.find((t) => t.id === activeTicketId);
    const overTicket = tickets.find((t) => t.id === overId);

    if (!activeTicket || !overTicket || activeTicketId === overId) return;

    if (activeTicket.columnId === overTicket.columnId) {
      const columnTickets = tickets.filter((t) => t.columnId === activeTicket.columnId);
      const oldIndex = columnTickets.findIndex((t) => t.id === activeTicketId);
      const newIndex = columnTickets.findIndex((t) => t.id === overId);
      const reordered = arrayMove(columnTickets, oldIndex, newIndex);

      const other = tickets.filter((t) => t.columnId !== activeTicket.columnId);
      setTickets([...other, ...reordered]);
    }
  };

  const activeTicket = tickets.find((t) => t.id === activeId);

  return (
    <>
      <Header />
      <div className="kanban-page">
        <div className="kanban-content">
          {/* Responsive Page Header */}
          <div className="kanban-header">
            <div className="kanban-header-left">
              <h1 className="kanban-title">Kanban Board</h1>
              <p className="kanban-subtitle">
                {tickets.length} tickets across {columns.length} columns
              </p>
            </div>

            <div className="kanban-header-actions">
              <div className="kanban-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="kanban-filter-btn" type="button">
                <Filter size={18} />
                <span className="btn-text">Filter</span>
              </button>

              <button className="kanban-add-ticket-btn" type="button">
                <Plus size={18} />
                <span className="btn-text">New Ticket</span>
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board" role="region" aria-label="Kanban board">
              {columns.map((column) => {
                const columnTickets = getTicketsByColumn(column.id);

                return (
                  <div key={column.id} className="kanban-column">
                    <div className="column-header" style={{ borderTopColor: column.color }}>
                      <div className="column-title-wrapper">
                        <div className="column-icon" style={{ color: column.color }}>
                          {column.icon}
                        </div>
                        <h3 className="column-title">{column.title}</h3>
                        <span className="column-count">{columnTickets.length}</span>
                      </div>
                      <button className="column-menu-btn" type="button" aria-label="Column menu">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <SortableContext
                      items={columnTickets.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="column-content" id={column.id}>
                        {columnTickets.map((ticket) => (
                          <SortableTicketCard key={ticket.id} ticket={ticket} />
                        ))}

                        <button className="add-card-btn" type="button">
                          <Plus size={16} />
                          Add Card
                        </button>
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeTicket ? (
                <div className="ticket-card dragging-overlay">
                  <div className="drag-handle">
                    <GripVertical size={16} />
                  </div>
                  <div className="ticket-header">
                    <span className={`priority-badge priority-${activeTicket.priority}`}>
                      {activeTicket.priority.charAt(0).toUpperCase() + activeTicket.priority.slice(1)}
                    </span>
                  </div>
                  <h4 className="ticket-title">{activeTicket.title}</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Kanban;
