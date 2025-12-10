import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import "../css/AddExperienceModal.css";

export default function AddExperienceModal({
  show,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [form, setForm] = useState({
    company: "",
    role: "",
    questionTitle: "",
    questionDescription: "",
    difficulty: "",
    tips: "",
  });
  const [error, setError] = useState("");

  /* -------------------------------------------------
        LOAD INITIAL DATA (Edit Mode)
    -------------------------------------------------- */
  useEffect(() => {
    if (initialData) {
      // Extract tips + difficulty if they were appended to questionDetail
      const detail = initialData.questionDetail || "";

      const extractedTips =
        /Tips:\s*([\s\S]*)/i.exec(detail)?.[1]?.trim() || "";

      const extractedDifficulty =
        /Difficulty:\s*(Easy|Medium|Hard)/i.exec(detail)?.[1] || "";

      setForm({
        company: initialData.company || "",
        role: initialData.role || "",
        questionTitle: initialData.questionTitle || "",
        questionDescription:
          initialData.questionDetail?.split("Tips:")[0]?.trim() || "",
        difficulty: extractedDifficulty,
        tips: extractedTips,
      });
    } else {
      setForm({
        company: "",
        role: "",
        questionTitle: "",
        questionDescription: "",
        difficulty: "",
        tips: "",
      });
    }
  }, [initialData, show]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* -------------------------------------------------
        SUBMIT HANDLER
        Sends backend-safe structure
    -------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Combine UI fields into backend's questionDetail
      const combinedDetail = `
${form.questionDescription.trim()}

${form.tips ? `Tips:\n${form.tips.trim()}` : ""}
${form.difficulty ? `\nDifficulty: ${form.difficulty}` : ""}
            `.trim();

      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        questionTitle: form.questionTitle.trim(),
        questionDetail: combinedDetail,
      };

      await onSubmit(payload);
      setError("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit experience");
    }
  }

  /* -------------------------------------------------
        RENDER
    -------------------------------------------------- */
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      backdrop="static"
      scrollable
      contentClassName="modal-dark"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="py-3 modal-dark-header">
          <Modal.Title className="fw-semibold fs-5">
            {initialData
              ? "✏️ Edit Interview Experience"
              : "Add Interview Experience"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="px-4 modal-dark-body"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-4">
            {/* LEFT COLUMN */}
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Company *</Form.Label>
                <Form.Control
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g. Google"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Job Role *</Form.Label>
                <Form.Control
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  value={form.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Tips / Advice</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={form.tips}
                  onChange={(e) => updateField("tips", e.target.value)}
                  placeholder="Any advice or preparation insights..."
                />
              </Form.Group>
            </Col>

            {/* RIGHT COLUMN */}
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label>Question Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.questionTitle}
                  onChange={(e) => updateField("questionTitle", e.target.value)}
                  placeholder="e.g. Clone Graph"
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Question Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={12}
                  style={{ resize: "none" }}
                  value={form.questionDescription}
                  onChange={(e) =>
                    updateField("questionDescription", e.target.value)
                  }
                  placeholder="Write the detailed question prompt or coding challenge..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between px-4 py-3 modal-dark-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="btn btn-primary px-4">
            {initialData ? "Save Changes" : "Submit"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

AddExperienceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};
