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
