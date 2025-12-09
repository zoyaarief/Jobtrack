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

   function normalizeUrl(rawUrl) {
      const trimmed = (rawUrl || "").trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
      return `https://${trimmed}`;
   }

   function updateField(k, v) {
      setApp((a) => ({ ...a, [k]: v }));
   }

   async function handleSave(e) {
      e.preventDefault();
      setSaving(true);
      setError("");
      try {
         const normalizedUrl = normalizeUrl(app.url);
         const payload = {
            company: app.company,
            role: app.role,
            submittedAt: app.submittedAt
               ? new Date(app.submittedAt).getTime()
               : undefined,
            url: normalizedUrl || undefined,
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
         <div className='loading-state'>
            <div className='spinner-border text-primary mb-3' role='status'>
               <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='text-muted'>Loading application details...</p>
         </div>
      );
   if (!app)
      return (
         <div className='error-state'>
            <div className='error-icon'>
               <FiTrash2 />
            </div>
            <h4 className='error-title'>Application Not Found</h4>
            <p className='error-message'>
               This application may have been deleted or doesn&apos;t exist.
            </p>
         </div>
      );

   return (
      <div className='container py-4 py-md-5'>
         <div className='edit-header'>
            <div>
               <h1 className='edit-title'>Edit Application</h1>
               <p className='edit-subtitle'>
                  Update your application details and track progress
               </p>
            </div>
            <div className='edit-actions'>
               <Button
                  variant='outline-danger'
                  className='btn-modern d-inline-flex align-items-center gap-2'
                  onClick={handleDelete}
               >
                  <FiTrash2 /> Delete Application
               </Button>
               <Button
                  className='btn-modern btn-primary-modern d-inline-flex align-items-center gap-2'
                  onClick={handleSave}
                  disabled={saving}
               >
                  <FiSave /> {saving ? "Saving…" : "Save Changes"}
               </Button>
            </div>
         </div>

         {error && (
            <Alert variant='danger' className='error-alert'>
               {error}
            </Alert>
         )}

         <Card className='card-modern'>
            <Card.Body className='p-4'>
               <Form onSubmit={handleSave} className='form-modern vstack gap-4'>
                  <Row className='g-3'>
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label>Company</Form.Label>
                           <Form.Control
                              value={app.company}
                              onChange={(e) =>
                                 updateField("company", e.target.value)
                              }
                              required
                           />
                        </Form.Group>
                     </Col>
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label>Role</Form.Label>
                           <Form.Control
                              value={app.role}
                              onChange={(e) =>
                                 updateField("role", e.target.value)
                              }
                           />
                        </Form.Group>
                     </Col>
                  </Row>
                  <Row className='g-3'>
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label>Status</Form.Label>
                           <Form.Select
                              value={app.status}
                              onChange={(e) =>
                                 updateField("status", e.target.value)
                              }
                           >
                              <option value='applied'>Applied</option>
                              <option value='interview'>Interview</option>
                              <option value='offer'>Offer</option>
                              <option value='rejected'>Rejected</option>
                           </Form.Select>
                        </Form.Group>
                     </Col>
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label>Submitted date</Form.Label>
                           <Form.Control
                              type='date'
                              value={app.submittedAt}
                              onChange={(e) =>
                                 updateField("submittedAt", e.target.value)
                              }
                           />
                        </Form.Group>
                     </Col>
                  </Row>
                  <Form.Group>
                     <Form.Label>Link</Form.Label>
                     <Form.Control
                        type='url'
                        value={app.url}
                        onChange={(e) => updateField("url", e.target.value)}
                        onBlur={(e) =>
                           updateField("url", normalizeUrl(e.target.value))
                        }
                        placeholder='https://...'
                     />
                  </Form.Group>
                  <Form.Group>
                     <Form.Label>Notes</Form.Label>
                     <Form.Control
                        as='textarea'
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
