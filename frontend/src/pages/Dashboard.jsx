import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  Table,
  Badge,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  FiExternalLink,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiBriefcase,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { api } from "../api.js";
import "../css/Dashboard.css";

function formatDate(value) {
  try {
    const d = new Date(typeof value === "number" ? value : value || Date.now());
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function Dashboard({ token }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    role: "",
    submittedAt: "",
    url: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [statusSaving, setStatusSaving] = useState({});

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending" },
  ];

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const list = await api.applications.list(token);
      setApps(list || []);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function normalizeUrl(rawUrl) {
    const trimmed = (rawUrl || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
    return `https://${trimmed}`;
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const normalizedUrl = normalizeUrl(form.url);
      const payload = {
        company: form.company,
        role: form.role,
        submittedAt: form.submittedAt
          ? new Date(form.submittedAt).getTime()
          : undefined,
        url: normalizedUrl || undefined,
        notes: form.notes || undefined,
      };
      await api.applications.create(token, payload);
      setForm({
        company: "",
        role: "",
        submittedAt: "",
        url: "",
        notes: "",
      });
      setShowCreate(false);
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to create application");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.applications.remove(token, id);
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  }

  async function handleStatusChange(id, status) {
    // optimistic updates (yay)
    const prevApps = apps;
    const current = apps.find((item) => item._id === id);
    if (!current) return;

    const payload = {
      company: current.company,
      role: current.role,
      submittedAt: current.submittedAt,
      url: current.url,
      notes: current.notes,
      status,
    };

    setError("");
    setStatusSaving((s) => ({ ...s, [id]: true }));
    setApps((list) =>
      list.map((item) => (item._id === id ? { ...item, status } : item)),
    );
    try {
      await api.applications.update(token, id, payload);
    } catch (err) {
      setApps(prevApps);
      setError(err.message || "Failed to update status");
    } finally {
      setStatusSaving((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  const total = apps.length;
  const appliedCount = apps.filter(
    (a) => a.status === "applied" || !a.status,
  ).length;
  const interviewCount = apps.filter((a) => a.status === "interview").length;
  const rejectedCount = apps.filter((a) => a.status === "rejected").length;

  return (
    <div className="container py-4 py-md-5">
      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h1
            className="h3 mb-2 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Job Applications Dashboard
          </h1>
          <p className="text-secondary mb-0">
            Track and manage your job search progress
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="btn-cta-primary d-inline-flex align-items-center gap-2"
        >
          <FiPlus style={{ fontSize: "1.25rem" }} />
          Add Application
        </Button>
      </div>

      {/* Stats Cards */}
      {total > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <Card className="card-modern h-100">
              <Card.Body className="text-center p-3">
                <div className="stats-icon info text-center">
                  <FiBriefcase />
                </div>
                <h3
                  className="h4 mb-1 fw-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {total}
                </h3>
                <p className="text-secondary small mb-0">Total Applications</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card className="card-modern h-100">
              <Card.Body className="text-center p-3">
                <div className="stats-icon success">
                  <span>✓</span>
                </div>
                <h3
                  className="h4 mb-1 fw-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {appliedCount}
                </h3>
                <p className="text-secondary small mb-0">Applied</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card className="card-modern h-100">
              <Card.Body className="text-center p-3">
                <div className="stats-icon warning">
                  <span>🎯</span>
                </div>
                <h3
                  className="h4 mb-1 fw-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {interviewCount}
                </h3>
                <p className="text-secondary small mb-0">Interviews</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card className="card-modern h-100">
              <Card.Body className="text-center p-3">
                <div className="stats-icon danger">
                  <span>✗</span>
                </div>
                <h3
                  className="h4 mb-1 fw-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {rejectedCount}
                </h3>
                <p className="text-secondary small mb-0">Rejected</p>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <Card className="card-modern">
        <Card.Body className="p-0">
          {error && (
            <Alert
              variant="danger"
              role="alert"
              aria-live="assertive"
              className="mb-0 rounded-0"
            >
              {error}
            </Alert>
          )}
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary mb-0">
                Loading your applications...
              </p>
            </div>
          ) : total === 0 ? (
            <div className="p-5 text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiBriefcase style={{ fontSize: "2.5rem" }} />
                </div>
              </div>
              <h4 className="text-secondary mb-2">No applications yet</h4>
              <p className="text-muted mb-4">
                Start tracking your job search by adding your first application
              </p>
              <Button
                onClick={() => setShowCreate(true)}
                className="btn-modern btn-primary-modern"
              >
                <FiPlus className="me-2" />
                Add Your First Application
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-modern mb-0">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a._id} className="table-row-hover">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="company-avatar me-2">
                            {(a.company || "U")[0].toUpperCase()}
                          </div>
                          <span className="fw-medium">
                            {a.company || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td>{a.role || "Not specified"}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={
                              a.status === "interview"
                                ? "warning"
                                : a.status === "rejected"
                                  ? "danger"
                                  : a.status === "offer"
                                    ? "info"
                                    : a.status === "applied" || !a.status
                                      ? "success"
                                      : "secondary"
                            }
                            text="white"
                          >
                            {a.status === "interview"
                              ? "Interview"
                              : a.status === "rejected"
                                ? "Rejected"
                                : a.status === "offer"
                                  ? "Offer"
                                  : a.status === "applied" || !a.status
                                    ? "Applied"
                                    : "Pending"}
                          </Badge>
                          <Form.Select
                            size="sm"
                            className="status-select"
                            aria-label={`Update status for ${a.company || "application"}`}
                            value={a.status || "applied"}
                            onChange={(e) =>
                              handleStatusChange(a._id, e.target.value)
                            }
                            aria-busy={!!statusSaving[a._id]}
                            disabled={!!statusSaving[a._id]}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                      </td>
                      <td>{formatDate(a.submittedAt)}</td>
                      <td>
                        <span className="text-muted small">
                          {a.notes
                            ? a.notes.length > 30
                              ? `${a.notes.substring(0, 30)}...`
                              : a.notes
                            : "No notes"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {a.url && (
                            <Button
                              as="a"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              size="sm"
                              variant="outline-secondary"
                            >
                              <FiExternalLink /> Open
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => navigate(`/applications/${a._id}`)}
                          >
                            <FiEdit /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(a._id)}
                          >
                            <FiTrash2 /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        centered
        size="lg"
      >
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2 fw-bold">
              <div className="add-app-icon">
                <FiPlus />
              </div>
              Add New Application
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Company *</Form.Label>
                <Form.Control
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g. Google, Microsoft"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Job Role</Form.Label>
                <Form.Control
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Application Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.submittedAt}
                  onChange={(e) => updateField("submittedAt", e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Job Posting Link</Form.Label>
                <Form.Control
                  type="url"
                  value={form.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  onBlur={(e) =>
                    updateField("url", normalizeUrl(e.target.value))
                  }
                  placeholder="https://company.com/careers/job-123"
                />
              </div>
              <div className="col-12 mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Any additional notes about this application..."
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-modern btn-primary-modern"
              disabled={saving}
            >
              {saving ? "Creating..." : "Add Application"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

Dashboard.propTypes = {
  token: PropTypes.string.isRequired,
};
