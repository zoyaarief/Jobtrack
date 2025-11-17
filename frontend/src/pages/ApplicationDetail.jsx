/*
ApplicationDetail.jsx — drop-in review notes

• Data fetching & cancellation
  - Use AbortController to cancel in-flight fetch on unmount/id change to avoid setState on unmounted.
  - Distinguish 404 vs 403 vs network errors; show tailored messages and a “Back” button.

• Save UX & validation
  - Disable “Save Changes” until form is dirty (compare to initial snapshot).
  - Validate fields (zod/yup or HTML constraints): company (required), role (optional), url (valid URL), submittedAt (valid date).
  - Show inline field errors; focus first invalid input on submit.

• Delete safety
  - Confirm before delete (modal or window.confirm). After delete, toast success and navigate(-1) or to /dashboard.

• Form state & libs
  - Consider react-hook-form + zod resolver for schema + dirty tracking + better performance on large forms.

• Date handling
  - Beware timezones: currently converting to ISO yyyy-mm-dd string. When saving, send an ISO date (e.g., `2025-11-17`) or UTC midnight to avoid off-by-one.

• Error handling
  - Surface API status codes in `setError` (e.g., `Failed to save (400): <message>`).
  - Optionally add a top-level toast system for success/error instead of inline alert only.

• Performance & effects
  - Guard load effect on `id`: if same `id`, skip.
  - Memoize `updateField` with useCallback or use a single form library to prevent extra re-renders.

• Buttons & forms
  - Put type="submit" on Save button and rely on <Form onSubmit={handleSave}> (already done), but also prevent double submits (`disabled={saving}` + dirty check).
  - Add `variant="danger"` to Delete and `aria-label` for icons for accessibility.

• API payload consistency
  - Normalize payload keys server-side; avoid sending undefined (omit keys or send null explicitly).
  - Consider optimistic update or redirect with state: `navigate("/dashboard", { state: { justSaved: true } })`.

• Security & hygiene
  - Sanitize/escape notes server-side; on client, do not dangerouslySetInnerHTML anywhere it’s displayed.
  - Do not log token/error details with PII to console in production.

• Navigation & empty states
  - Add a small “Back to Dashboard” link near the title.
  - For “Application Not Found,” offer a button to create a new application.

• Styling & a11y
  - Associate labels with controls via `controlId` on Form.Group for better a11y.
  - Add `placeholder="Company name"` / screen-reader hints where useful.

• Types
  - Add a PropTypes shape (or migrate to TypeScript) for `app` object when lifting state or using context.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FiSave, FiTrash2 } from "react-icons/fi";
import PropTypes from "prop-types";
import { api } from "../api.js";
import "../css/ApplicationDetail.css";

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
      <div className="loading-state">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading application details...</p>
      </div>
    );
  if (!app)
    return (
      <div className="error-state">
        <div className="error-icon">
          <FiTrash2 />
        </div>
        <h4 className="error-title">Application Not Found</h4>
        <p className="error-message">
          This application may have been deleted or doesn't exist.
        </p>
      </div>
    );

  return (
    <div className="container py-4 py-md-5">
      <div className="edit-header">
        <div>
          <h1 className="edit-title">Edit Application</h1>
          <p className="edit-subtitle">
            Update your application details and track progress
          </p>
        </div>
        <div className="edit-actions">
          <Button
            variant="outline-danger"
            className="btn-modern d-inline-flex align-items-center gap-2"
            onClick={handleDelete}
          >
            <FiTrash2 /> Delete Application
          </Button>
          <Button
            className="btn-modern btn-primary-modern d-inline-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave /> {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="error-alert">
          {error}
        </Alert>
      )}

      <Card className="card-modern">
        <Card.Body className="p-4">
          <Form onSubmit={handleSave} className="form-modern vstack gap-4">
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
