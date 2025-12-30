// src/pages/CreateTicket.tsx
// ============================================
// IMPROVED VERSION - Modular & Clean
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../style/CreateTicket.css';
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
  Check
} from 'lucide-react';


interface CategoryOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}


interface PriorityOption {
  value: string;
  label: string;
  className: string; // IMPROVED: Use CSS class instead of inline color
  icon: React.ReactNode;
  description: string;
}


const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);


  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: '' as string,
    assignee: '',
    dueDate: '',
    attachments: [] as File[]
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showDraftBanner, setShowDraftBanner] = useState(false); // IMPROVED: Draft banner instead of window.confirm
  const [hasDraft, setHasDraft] = useState(false);


  // Category options with descriptions
  const categories: CategoryOption[] = [
    {
      value: 'Technical',
      label: 'Technical',
      icon: <Zap size={20} />,
      description: 'System errors, bugs, or technical difficulties'
    },
    {
      value: 'Security',
      label: 'Security',
      icon: <Shield size={20} />,
      description: 'Security concerns, vulnerabilities, or access issues'
    },
    {
      value: 'Feature',
      label: 'Feature Request',
      icon: <Sparkles size={20} />,
      description: 'New feature suggestions or enhancements'
    },
    {
      value: 'Account',
      label: 'Account',
      icon: <UserCircle size={20} />,
      description: 'Account management, billing, or subscription issues'
    },
    {
      value: 'Bug',
      label: 'Bug Report',
      icon: <AlertCircle size={20} />,
      description: 'Report unexpected behavior or errors'
    }
  ];


  // IMPROVED: Priority options with CSS class names (no inline styles)
  const priorities: PriorityOption[] = [
    {
      value: 'low',
      label: 'Low',
      className: 'priority-card--low',
      icon: <Clock size={16} />,
      description: 'Non-urgent, can be scheduled'
    },
    {
      value: 'medium',
      label: 'Medium',
      className: 'priority-card--medium',
      icon: <TrendingUp size={16} />,
      description: 'Important, needs attention soon'
    },
    {
      value: 'high',
      label: 'High',
      className: 'priority-card--high',
      icon: <AlertCircle size={16} />,
      description: 'Critical, requires quick resolution'
    },
    {
      value: 'urgent',
      label: 'Urgent',
      className: 'priority-card--urgent',
      icon: <Zap size={16} />,
      description: 'Emergency, immediate action required'
    }
  ];


  // Team members with roles
  const teamMembers = [
    { name: 'Sarah Johnson', role: 'Senior Engineer', avatar: 'SJ' },
    { name: 'Mike Chen', role: 'Technical Lead', avatar: 'MC' },
    { name: 'Alex Rivera', role: 'DevOps Engineer', avatar: 'AR' },
    { name: 'Emma Davis', role: 'Product Manager', avatar: 'ED' },
    { name: 'John Smith', role: 'Frontend Developer', avatar: 'JS' },
    { name: 'Lisa Wong', role: 'UX Designer', avatar: 'LW' },
    { name: 'Ahmed Khalil', role: 'Backend Developer', avatar: 'AK' },
    { name: 'Maria Garcia', role: 'QA Engineer', avatar: 'MG' }
  ];


  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        setAutoSaveStatus('saving');
        setTimeout(() => {
          localStorage.setItem('draftTicket', JSON.stringify(formData));
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);


  // IMPROVED: Load draft on mount with inline banner instead of window.confirm
  useEffect(() => {
    const draft = localStorage.getItem('draftTicket');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed.title || parsed.description) {
        setHasDraft(true);
        setShowDraftBanner(true);
      }
    }
  }, []);


  // IMPROVED: Handle draft restore
  const handleRestoreDraft = () => {
    const draft = localStorage.getItem('draftTicket');
    if (draft) {
      setFormData(JSON.parse(draft));
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('draftTicket');
    setShowDraftBanner(false);
    setHasDraft(false);
  };


  // IMPROVED: Validation only triggers after user starts typing
  const validateField = (name: string, value: any) => {
    const errors: { [key: string]: string } = { ...validationErrors };

    switch (name) {
      case 'title':
        if (value.length > 0 && value.length < 10) {
          errors.title = 'Title must be at least 10 characters';
        } else {
          delete errors.title;
        }
        break;
      case 'description':
        if (value.length > 0 && value.length < 20) {
          errors.description = 'Description must be at least 20 characters';
        } else {
          delete errors.description;
        }
        break;
      case 'category':
        if (!value) {
          errors.category = 'Please select a category';
        } else {
          delete errors.category;
        }
        break;
    }

    setValidationErrors(errors);
  };


  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };


  // Handle assignee input
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, assignee: value }));

    if (value.length > 0) {
      const suggestions = teamMembers.filter(member =>
        member.name.toLowerCase().includes(value.toLowerCase()) ||
        member.role.toLowerCase().includes(value.toLowerCase())
      );
      setAssigneeSuggestions(suggestions.map(m => m.name));
      setShowAssigneeDropdown(true);
    } else {
      setShowAssigneeDropdown(false);
    }
  };


  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        // IMPROVED: Could use toast notification here instead of alert
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };


  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };


  const handleDragLeave = () => {
    setIsDragOver(false);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      return file.size <= maxSize;
    });
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };


  // Remove attachment
  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };


  // Form validation
  const isFormValid = () => {
    return formData.title.trim().length >= 10 &&
      formData.category !== '' &&
      formData.description.trim().length >= 20 &&
      Object.keys(validationErrors).length === 0;
  };


  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show success animation
    setShowSuccessAnimation(true);

    // Clear draft
    localStorage.removeItem('draftTicket');

    // Wait for animation
    setTimeout(() => {
      navigate('/my-tickets', {
        state: {
          message: 'Ticket created successfully!',
          ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`
        }
      });
    }, 1500);
  };


  // IMPROVED: Inline save draft (no alert)
  const handleSaveDraft = () => {
    localStorage.setItem('draftTicket', JSON.stringify(formData));
    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus('idle'), 2000);
  };


  // Get file icon
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image size={16} />;
    }
    return <FileText size={16} />;
  };


  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };


  return (
    <div className="create-ticket-page">
      {showSuccessAnimation && (
        <div className="success-overlay">
          <div className="success-animation">
            <div className="success-checkmark">
              <CheckCircle size={64} />
            </div>
            <h2>Ticket Created Successfully!</h2>
            <p>Redirecting you to your tickets...</p>
          </div>
        </div>
      )}


      <div className="create-ticket-content">
        {/* Enhanced Header */}
        <div className="page-header">
          <div className="header-top">
            <button
              className="back-btn"
              onClick={() => navigate('/my-tickets')}
              aria-label="Back to tickets"
              type="button"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            {autoSaveStatus !== 'idle' && (
              <div className="auto-save-indicator">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="saving-spinner" size={14} />
                    <span>Saving draft...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <Check size={14} />
                    <span>Draft saved</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="header-content">
            <div className="header-icon">
              <MessageSquare size={32} />
            </div>
            <div>
              <h1 className="page-title">Create New Ticket</h1>
              <p className="page-subtitle">Submit a detailed ticket to get help from our support team</p>
            </div>
          </div>
        </div>

        {/* IMPROVED: Draft restore banner (replaces window.confirm) */}
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
              <button className="draft-btn restore" onClick={handleRestoreDraft}>
                Restore Draft
              </button>
              <button className="draft-btn discard" onClick={handleDiscardDraft}>
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="ticket-form">
          {/* Progress Indicator */}
          <div className="form-progress">
            <div className="progress-step active">
              <div className="step-number">1</div>
              <span>Basic Info</span>
            </div>
            <div className={`progress-step ${formData.title && formData.category ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Details</span>
            </div>
            <div className={`progress-step ${isFormValid() ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Review</span>
            </div>
          </div>

          {/* Title Field with Character Counter */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">
                <Tag size={18} />
                Basic Information
              </h3>
            </div>

            <div className={`form-group ${validationErrors.title ? 'has-error' : ''}`}>
              <label className="form-label">
                Ticket Title
                <span className="required-indicator">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Login authentication issue on mobile app"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input title-input"
                  maxLength={200}
                />
                <div className="input-meta">
                  <span className={`char-count ${formData.title.length > 180 ? 'warning' : ''}`}>
                    {formData.title.length}/200
                  </span>
                </div>
              </div>
              {validationErrors.title && (
                <div className="validation-error">
                  <AlertCircle size={14} />
                  <span>{validationErrors.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Grid */}
          <div className="form-section">
            <div className={`form-group ${validationErrors.category ? 'has-error' : ''}`}>
              <label className="form-label">
                Category
                <span className="required-indicator">*</span>
              </label>
              <div className="category-grid">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: cat.value }));
                      validateField('category', cat.value);
                    }}
                  >
                    <div className="category-icon">{cat.icon}</div>
                    <div className="category-content">
                      <span className="category-label">{cat.label}</span>
                      <span className="category-description">{cat.description}</span>
                    </div>
                    <div className="category-check">
                      <CheckCircle size={20} />
                    </div>
                  </button>
                ))}
              </div>
              {validationErrors.category && (
                <div className="validation-error">
                  <AlertCircle size={14} />
                  <span>{validationErrors.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* IMPROVED: Priority Selector with CSS classes (no inline styles) */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Priority Level
                <span className="tooltip-trigger">
                  <Info size={14} />
                  <span className="tooltip">Select based on urgency and business impact</span>
                </span>
              </label>
              <div className="priority-grid">
                {priorities.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    className={`priority-card ${priority.className} ${formData.priority === priority.value ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  >
                    <div className="priority-icon">{priority.icon}</div>
                    <div className="priority-content">
                      <span className="priority-label">{priority.label}</span>
                      <span className="priority-description">{priority.description}</span>
                    </div>
                    <div className="priority-indicator" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rich Text Description */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">
                <MessageSquare size={18} />
                Detailed Description
              </h3>
            </div>

            <div className={`form-group ${validationErrors.description ? 'has-error' : ''}`}>
              <label className="form-label">
                Description
                <span className="required-indicator">*</span>
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
                  name="description"
                  placeholder="Provide detailed information:&#10;• What happened?&#10;• Steps to reproduce&#10;• Expected vs actual behavior&#10;• Any error messages"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={10}
                  className="editor-textarea"
                  maxLength={5000}
                />
                <div className="editor-footer">
                  <span className={`char-count ${formData.description.length > 4500 ? 'warning' : ''}`}>
                    {formData.description.length}/5000
                  </span>
                </div>
              </div>
              {validationErrors.description && (
                <div className="validation-error">
                  <AlertCircle size={14} />
                  <span>{validationErrors.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignment & Timeline */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">
                <User size={18} />
                Assignment & Timeline
              </h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <div className="assignee-input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={formData.assignee}
                    onChange={handleAssigneeChange}
                    onFocus={() => formData.assignee && setShowAssigneeDropdown(true)}
                    onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 200)}
                    className="form-input assignee-input"
                  />
                  {showAssigneeDropdown && assigneeSuggestions.length > 0 && (
                    <div className="assignee-dropdown">
                      {assigneeSuggestions.map(suggestion => {
                        const member = teamMembers.find(m => m.name === suggestion);
                        return (
                          <div
                            key={suggestion}
                            className="assignee-option"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, assignee: suggestion }));
                              setShowAssigneeDropdown(false);
                            }}
                          >
                            <div className="assignee-avatar">{member?.avatar}</div>
                            <div className="assignee-info">
                              <span className="assignee-name">{suggestion}</span>
                              <span className="assignee-role">{member?.role}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <div className="date-input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input date-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Attachments with Drag & Drop */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">
                <Paperclip size={18} />
                Attachments
              </h3>
              <span className="section-hint">Optional - Max 10MB per file</span>
            </div>

            <div className="form-group">
              <div
                className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
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
                    <span className="files-count">{formData.attachments.length} file{formData.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="files-list">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-icon-wrapper">
                          {getFileIcon(file.name)}
                        </div>
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

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => navigate('/my-tickets')}
            >
              <X size={18} />
              Cancel
            </button>

            <div className="primary-actions">
              <button
                type="button"
                className="action-btn tertiary"
                onClick={handleSaveDraft}
                disabled={!formData.title && !formData.description}
              >
                <Save size={18} />
                Save Draft
              </button>

              <button
                type="submit"
                className={`action-btn primary ${isFormValid() ? 'enabled' : ''}`}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="loading-spinner" size={18} />
                    Creating Ticket...
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

          {/* Helper Text */}
          <div className="form-helper">
            <Info size={16} />
            <p>
              Need help? Check our{' '}
              <a href="/help" target="_blank" rel="noopener noreferrer">support documentation</a>
              {' '}or contact us directly.
            </p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};


export default CreateTicket;
