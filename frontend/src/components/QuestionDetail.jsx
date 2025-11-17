/*
QuestionDetail.jsx — drop-in review notes

• Loading/empty/error states
  - Add a distinct "loading…" skeleton and an explicit error fallback instead of only null/empty.
  - Keep the current "select a question" empty state (good).

• Security & content rendering
  - Never render untrusted HTML; keep plain text. If you later support rich text/Markdown, sanitize first (e.g., DOMPurify).
  - Preserve formatting for long descriptions (newline → <br/> or CSS white-space: pre-wrap).

• UX polish
  - Show difficulty with a colored badge (Easy/Medium/Hard) and add a tooltip for what difficulty means.
  - Truncate ultra-long description/tips with “Show more / Show less”.
  - Add a small copy-to-clipboard button for the prompt/title.
  - If tags exist, make them clickable to filter questions by tag.

• Accessibility
  - Promote “Question Details” to an <h2> and ensure a landmark/region (role="region" aria-labelledby).
  - Provide aria-live="polite" for content changes when a different question is selected.
  - Ensure the “Generate AI Answer” disabled button has aria-disabled="true" and a title explaining why.

• State resilience
  - Guard against missing fields (already done) and trim strings before display.
  - Normalize difficulty casing on input (“easy” → “Easy”).

• Buttons & actions
  - Replace the disabled AI button with a tertiary link-styled button and keep it focusable, or hide when feature-gated.
  - If edit/delete actions will be added, show them conditionally based on ownership/role.

• Styling & structure
  - Move utility classes to CSS (QuestionDetail.css) and use BEM-style names (.question-detail__title, __card, __tags).
  - Add max-width and responsive spacing for readability; ensure color-contrast AA.

• Testability
  - Add data-testid attributes on the major sections (title, company, role, difficulty, description, tips, tags).

*/
import React from "react";
import PropTypes from "prop-types";
import "../css/QuestionDetail.css";

export default function QuestionDetail({ question }) {
  if (!question) {
    return (
      <div className="question-detail empty">
        <p>📝 Select a question to view details.</p>
      </div>
    );
  }

  return (
    <div className="question-detail">
      <h3 className="fw-bold mb-3">Question Details</h3>

      <div className="question-card p-3 shadow-sm rounded bg-light">
        <p><strong>Company:</strong> {question.company || "Unknown"}</p>
        <p><strong>Role:</strong> {question.role || "Not specified"}</p>
        <p><strong>Difficulty:</strong> {question.difficulty || "Not mentioned"}</p>

        <div className="question-body mt-3">
          <h5 className="fw-semibold">{question.questionTitle || "Untitled Question"}</h5>
          <p className="mt-2 text-muted">
            {question.questionDescription || "No detailed description available."}
          </p>
        </div>

        <div className="tips-section mt-3">
          <strong>Tips / Advice:</strong>
          <p>{question.tips || "No tips shared for this question."}</p>
        </div>

        <button className="ai-btn mt-3" disabled>
          💡 Generate AI Answer (Coming Soon)
        </button>

        {question.tags?.length > 0 && (
          <div className="tag-list mt-2">
            {question.tags.map((tag) => (
              <span key={tag} className="tag badge bg-secondary me-2">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

QuestionDetail.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string,
    company: PropTypes.string,
    role: PropTypes.string,
    questionTitle: PropTypes.string,
    questionDescription: PropTypes.string,
    difficulty: PropTypes.string,
    tips: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};
