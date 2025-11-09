import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FiSave, FiTrash2 } from "react-icons/fi";
import PropTypes from "prop-types";
import { api } from "../api.js";

export default function ApplicationDetail({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [app, setApp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.applications.get(token, id);
        if (!cancelled) {
          setApp({
            company: data.company || "",
            role: data.role || "",
            status: data.status || "applied",
            submittedAt: data.submittedAt
              ? new Date(data.submittedAt).toISOString().slice(0, 10)
              : "",
            url: data.url || "",
            notes: data.notes || "",
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  function updateField(k, v) {
    setApp((a) => ({ ...a, [k]: v }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        company: app.company,
        role: app.role,
        submittedAt: app.submittedAt
          ? new Date(app.submittedAt).getTime()
          : undefined,
        url: app.url || undefined,
        notes: app.notes || undefined,
      };
      // allow updating status too
      if (app.status) payload.status = app.status;
      await api.applications.update(token, id, payload);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.applications.remove(token, id);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Failed to delete");
    }
  }

  if (loading)
    return (
      <div className="container py-5 text-center text-secondary">Loading…</div>
    );
  if (!app)
    return (
      <div className="container py-5 text-center text-secondary">Not found</div>
    );

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Edit application</h1>
          <div className="text-secondary small">Update details and status</div>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-danger"
            className="d-inline-flex align-items-center gap-2"
            onClick={handleDelete}
          >
            <FiTrash2 /> Delete
          </Button>
          <Button
            className="d-inline-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSave} className="vstack gap-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    value={app.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    value={app.role}
                    onChange={(e) => updateField("role", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={app.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Submitted date</Form.Label>
                  <Form.Control
                    type="date"
                    value={app.submittedAt}
                    onChange={(e) => updateField("submittedAt", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="url"
                value={app.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://..."
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={app.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </Form.Group>
          </Form>
        </Card.Body>
         </Card>
      </div>
   );
}

ApplicationDetail.propTypes = {
   token: PropTypes.string.isRequired,
};
