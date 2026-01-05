// src/pages/CreateTicket.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../style/CreateTicket.css";

import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  TrendingUp,
  X,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  Link,
  Calendar,
  Save,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  UserCircle,
  Info,
  Upload,
  FileText,
  Check,
} from "lucide-react";

// ✅ API
import { createTicket, TicketCategory, TicketPriority } from "../../api/tickets";
import { getUsers, UserDTO } from "../../api/users";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CategoryOption {
  value: TicketCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface PriorityOption {
  value: TicketPriority;
  label: string;
  className: string;
  icon: React.ReactNode;
  description: string;
}

interface FormData {
  title: string;
  description: string;
  priority: TicketPriority;
  category: "" | TicketCategory;
  assigneeId: string; // user _id
  dueDate: string;
  attachments: File[];
}

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: CategoryOption[] = [
  {
    value: "Technical",
    label: "Technical",
    icon: <Zap size={20} />,
    description: "System errors, bugs, or technical difficulties",
  },
  {
    value: "Security",
    label: "Security",
    icon: <Shield size={20} />,
    description: "Security concerns, vulnerabilities, or access issues",
  },
  {
    value: "Feature",
    label: "Feature Request",
    icon: <Sparkles size={20} />,
    description: "New feature suggestions or enhancements",
  },
  {
    value: "Account",
    label: "Account",
    icon: <UserCircle size={20} />,
    description: "Account management, billing, or subscription issues",
  },
  {
    value: "Bug",
    label: "Bug Report",
    icon: <AlertCircle size={20} />,
    description: "Report unexpected behavior or errors",
  },
];

const PRIORITIES: PriorityOption[] = [
  {
    value: "low",
    label: "Low",
    className: "priority-low",
    icon: <Clock size={16} />,
    description: "Non-urgent, can be scheduled",
  },
  {
    value: "medium",
    label: "Medium",
    className: "priority-medium",
    icon: <TrendingUp size={16} />,
    description: "Important, needs attention soon",
  },
  {
    value: "high",
    label: "High",
    className: "priority-high",
    icon: <AlertCircle size={16} />,
    description: "Critical, requires quick resolution",
  },
  {
    value: "urgent",
    label: "Urgent",
    className: "priority-urgent",
    icon: <Zap size={16} />,
    description: "Emergency, immediate action required",
  },
];

const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 5000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

const DRAFT_STORAGE_KEY = "draftTicket";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    assigneeId: "",
    dueDate: "",
    attachments: [],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Users for assignee dropdown
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Fetch users for assignment
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setUsersLoading(true);
        setUsersError("");

        // If your backend supports filters, you can pass params:
        // const data = await getUsers({ status: "available" });
        const data = await getUsers();

        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        setUsersError(e?.response?.data?.message || e?.message || "Failed to load users");
        setUsers([]);
      } finally {
        if (!mounted) return;
        setUsersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.title ||
        formData.description ||
        formData.category ||
        formData.assigneeId ||
        formData.dueDate
      ) {
        setAutoSaveStatus("saving");
        setTimeout(() => {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 1500);
        }, 400);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft banner
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed?.title || parsed?.description || parsed?.category) {
        setHasDraft(true);
        setShowDraftBanner(true);
      }
    }
  }, []);

  // ========================================================================
  // MEMO
  // ========================================================================

  const filteredUsers = useMemo(() => {
    const q = assigneeSearch.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      return name.includes(q) || email.includes(q) || dept.includes(q) || role.includes(q);
    });
  }, [users, assigneeSearch]);

  const isFormValid = useMemo(() => {
    return (
      formData.title.trim().length >= VALIDATION_RULES.TITLE_MIN_LENGTH &&
      formData.description.trim().length >= VALIDATION_RULES.DESCRIPTION_MIN_LENGTH &&
      formData.category !== "" &&
      Object.keys(errors).length === 0
    );
  }, [formData.title, formData.description, formData.category, errors]);

  // ========================================================================
  // VALIDATION
  // ========================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters`;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      newErrors.description = `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    // Assignee must exist in users list (if selected)
    if (formData.assigneeId) {
      const exists = users.some((u) => u._id === formData.assigneeId);
      if (!exists) newErrors.assigneeId = "Selected assignee is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleCancel = () => {
    navigate("/tickets");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) setApiError("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= VALIDATION_RULES.MAX_FILE_SIZE);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...validFiles] }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter((file) => file.size <= VALIDATION_RULES.MAX_FILE_SIZE);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...validFiles] }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    setAutoSaveStatus("saved");
    setTimeout(() => setAutoSaveStatus("idle"), 1500);
  };

  const handleRestoreDraft = () => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      setFormData(JSON.parse(draft));
    }
    setShowDraftBanner(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setShowDraftBanner(false);
    setHasDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      };

      if (formData.assigneeId.trim()) payload.assignee = formData.assigneeId.trim();
      if (formData.dueDate) payload.dueDate = new Date(formData.dueDate).toISOString();

      await createTicket(payload);

      setSuccess(true);
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      setTimeout(() => {
        navigate("/tickets", { state: { message: "Ticket created successfully!" } });
      }, 1200);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UTILS
  // ========================================================================

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return <Image size={16} />;
    return <FileText size={16} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPriorityBadgeClass = (priority: string) => {
    const classes: Record<string, string> = {
      low: "priority-low",
      medium: "priority-medium",
      high: "priority-high",
      urgent: "priority-urgent",
    };
    return classes[priority] || "";
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-top">
            <button className="back-btn" onClick={handleCancel} type="button">
              <ArrowLeft size={20} />
              Back to Tickets
            </button>

            {autoSaveStatus !== "idle" && (
              <div className="auto-save-indicator">
                {autoSaveStatus === "saving" && (
                  <>
                    <Loader2 className="saving-spinner" size={14} />
                    <span>Saving draft...</span>
                  </>
                )}
                {autoSaveStatus === "saved" && (
                  <>
                    <Check size={14} />
                    <span>Draft saved</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="header-main">
            <div className="header-icon">
              <MessageSquare size={32} />
            </div>
            <div className="header-text">
              <h1 className="page-title">Create New Ticket</h1>
              <p className="page-subtitle">Submit a detailed ticket to get help from our support team</p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="success-banner">
            <CheckCircle size={24} />
            <div className="success-text">
              <h3>Ticket Created Successfully!</h3>
              <p>Redirecting to tickets list...</p>
            </div>
          </div>
        )}

        {/* Draft Restore Banner */}
        {showDraftBanner && hasDraft && (
          <div className="draft-restore-banner">
            <div className="draft-restore-content">
              <Info size={20} />
              <div className="draft-restore-text">
                <strong>Draft Found</strong>
                <span>You have unsaved changes from a previous session</span>
              </div>
            </div>
            <div className="draft-restore-actions">
              <button className="draft-btn restore" type="button" onClick={handleRestoreDraft}>
                Restore Draft
              </button>
              <button className="draft-btn discard" type="button" onClick={handleDiscardDraft}>
                Discard
              </button>
            </div>
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Failed:</strong> {apiError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-ticket-form">
          {/* Basic Information */}
          <div className="form-section">
            <div className="section-header">
              <Tag size={20} />
              <h2>Basic Information</h2>
            </div>

            <div className="section-content">
              <div className="form-group full-width">
                <label htmlFor="title">
                  Ticket Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "error" : ""}
                  placeholder="e.g., Login authentication issue on mobile app"
                  maxLength={VALIDATION_RULES.TITLE_MAX_LENGTH}
                />
                <div className="input-meta">
                  <span
                    className={`char-count ${
                      formData.title.length > VALIDATION_RULES.TITLE_MAX_LENGTH - 20 ? "warning" : ""
                    }`}
                  >
                    {formData.title.length}/{VALIDATION_RULES.TITLE_MAX_LENGTH}
                  </span>
                </div>
                {errors.title && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.title}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="category">
                  <Tag size={16} />
                  Category <span className="required">*</span>
                </label>

                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`category-card ${formData.category === cat.value ? "selected" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, category: cat.value }));
                        if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                      }}
                    >
                      <div className="category-icon">{cat.icon}</div>
                      <div className="category-content">
                        <span className="category-label">{cat.label}</span>
                        <span className="category-description">{cat.description}</span>
                      </div>
                      {formData.category === cat.value && (
                        <div className="category-check">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {errors.category && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Priority & Assignment */}
          <div className="form-section">
            <div className="section-header">
              <TrendingUp size={20} />
              <h2>Priority & Assignment</h2>
            </div>

            <div className="section-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">
                    <TrendingUp size={16} />
                    Priority Level
                  </label>
                  <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} - {p.description}
                      </option>
                    ))}
                  </select>

                  {formData.priority && (
                    <div className="priority-preview">
                      <span className={`priority-badge ${getPriorityBadgeClass(formData.priority)}`}>
                        {PRIORITIES.find((p) => p.value === formData.priority)?.icon}
                        {PRIORITIES.find((p) => p.value === formData.priority)?.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* ✅ Assign To dropdown */}
                <div className="form-group">
                  <label htmlFor="assigneeId">
                    <User size={16} />
                    Assign To
                  </label>

                  <input
                    type="text"
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="Search by name / email / department / role..."
                    style={{ marginBottom: 8 }}
                  />

                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={formData.assigneeId}
                    onChange={handleChange}
                    className={errors.assigneeId ? "error" : ""}
                    disabled={usersLoading}
                  >
                    <option value="">
                      {usersLoading ? "Loading users..." : "Unassigned (optional)"}
                    </option>

                    {filteredUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} — {u.email}
                        {u.department ? ` — ${u.department}` : ""}
                        {u.role ? ` (${u.role})` : ""}
                        {u.status ? ` • ${u.status}` : ""}
                      </option>
                    ))}
                  </select>

                  {usersError && (
                    <span className="error-message">
                      <AlertCircle size={14} />
                      {usersError}
                    </span>
                  )}

                  {errors.assigneeId && (
                    <span className="error-message">
                      <AlertCircle size={14} />
                      {errors.assigneeId}
                    </span>
                  )}

                  {!!formData.assigneeId && (
                    <button
                      type="button"
                      className="btn-draft"
                      style={{ marginTop: 8 }}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, assigneeId: "" }));
                        setAssigneeSearch("");
                        if (errors.assigneeId) setErrors((prev) => ({ ...prev, assigneeId: "" }));
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">
                  <Calendar size={16} />
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <div className="section-header">
              <MessageSquare size={20} />
              <h2>Detailed Description</h2>
            </div>

            <div className="section-content">
              <div className="form-group full-width">
                <label htmlFor="description">
                  <MessageSquare size={16} />
                  Description <span className="required">*</span>
                </label>

                <div className="description-editor">
                  <div className="editor-toolbar">
                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" title="Bold">
                        <Bold size={16} />
                      </button>
                      <button type="button" className="toolbar-btn" title="Italic">
                        <Italic size={16} />
                      </button>
                      <button type="button" className="toolbar-btn" title="Underline">
                        <Underline size={16} />
                      </button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" title="Bulleted List">
                        <List size={16} />
                      </button>
                      <button type="button" className="toolbar-btn" title="Numbered List">
                        <ListOrdered size={16} />
                      </button>
                    </div>
                    <div className="toolbar-divider" />
                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" title="Insert Image">
                        <Image size={16} />
                      </button>
                      <button type="button" className="toolbar-btn" title="Insert Link">
                        <Link size={16} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={descriptionRef}
                    id="description"
                    name="description"
                    placeholder="Provide detailed information:&#10;• What happened?&#10;• Steps to reproduce&#10;• Expected vs actual behavior&#10;• Any error messages"
                    value={formData.description}
                    onChange={handleChange}
                    rows={10}
                    className={errors.description ? "editor-textarea error" : "editor-textarea"}
                    maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
                  />

                  <div className="editor-footer">
                    <span
                      className={`char-count ${
                        formData.description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH - 500
                          ? "warning"
                          : ""
                      }`}
                    >
                      {formData.description.length}/{VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                </div>

                {errors.description && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="form-section">
            <div className="section-header">
              <Paperclip size={20} />
              <h2>Attachments</h2>
            </div>

            <div className="section-content">
              <div className="form-group full-width">
                <label>
                  <Paperclip size={16} />
                  Upload Files (Optional - Max 10MB per file)
                </label>

                <div
                  className={`file-upload-area ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <div className="upload-icon">
                      <Upload size={32} />
                    </div>
                    <span className="upload-title">Drag & drop files here</span>
                    <span className="upload-subtitle">or click to browse</span>
                    <div className="upload-formats">
                      <span>PDF</span>
                      <span>DOC</span>
                      <span>Images</span>
                    </div>
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="attached-files">
                    <div className="files-header">
                      <h4>Attached Files</h4>
                      <span className="files-count">
                        {formData.attachments.length} file{formData.attachments.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="files-list">
                      {formData.attachments.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="file-item">
                          <div className="file-icon-wrapper">{getFileIcon(file.name)}</div>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => removeAttachment(index)}
                            title="Remove file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
              <X size={18} />
              Cancel
            </button>

            <div className="actions-right">
              <button
                type="button"
                className="btn-draft"
                onClick={handleSaveDraft}
                disabled={!formData.title && !formData.description && !formData.category}
              >
                <Save size={18} />
                Save Draft
              </button>

              <button type="submit" className="btn-submit" disabled={!isFormValid || loading || success}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Create Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateTicket;
