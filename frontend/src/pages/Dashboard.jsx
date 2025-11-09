import { useEffect, useState } from "react";
import { Card, Form, Button, Table, Badge, Modal } from "react-bootstrap";
import { FiExternalLink, FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { api } from "../api.js";

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

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        company: form.company,
        role: form.role,
        submittedAt: form.submittedAt
          ? new Date(form.submittedAt).getTime()
          : undefined,
        url: form.url || undefined,
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

  const total = apps.length;

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Applications</h1>
          <div className="text-secondary small">
            Track and manage your job search
          </div>
        </div>
        <div>
          <Button
            onClick={() => setShowCreate(true)}
            className="d-inline-flex align-items-center gap-2"
          >
            <FiPlus /> New application
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-4 text-center text-secondary">Loading…</div>
          ) : total === 0 ? (
            <div className="p-4 text-center text-secondary">
              No applications yet.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a._id}>
                      <td className="fw-medium">{a.company || "unknown"}</td>
                      <td>{a.role || ""}</td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {a.status || "applied"}
                        </Badge>
                      </td>
                      <td>{formatDate(a.submittedAt)}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {a.url && (
                            <a
                              className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FiExternalLink /> Open
                            </a>
                          )}
                          <button
                            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                            onClick={() => navigate(`/applications/${a._id}`)}
                          >
                            <FiEye /> View
                          </button>
                          <button
                            className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
                            onClick={() => handleDelete(a._id)}
                          >
                            <FiTrash2 /> Delete
                          </button>
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

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title>New application</Modal.Title>
          </Modal.Header>
          <Modal.Body className="vstack gap-3">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Form.Group>
              <Form.Label>Company</Form.Label>
              <Form.Control
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Control
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Submitted date</Form.Label>
              <Form.Control
                type="date"
                value={form.submittedAt}
                onChange={(e) => updateField("submittedAt", e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="url"
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://..."
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create"}
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
