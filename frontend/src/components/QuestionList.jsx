// src/components/QuestionList.jsx

import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Tab, Nav, Pagination, Form, Badge } from "react-bootstrap";
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../css/QuestionList.css";
import AddExperienceModal from "./AddExperienceModal";
import { api } from "../api.js";

// Constants
const QUESTIONS_PER_PAGE = 10;

export default function QuestionList({ company, token, user }) {
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [activeTab, setActiveTab] = useState("question");
    const [showEditModal, setShowEditModal] = useState(false);

    // PAGINATION AND SORTING STATE
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [sortOrder, setSortOrder] = useState("recent");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Helper to parse the question details
    const parseQuestionDetail = (q) => {
        const detail = q.questionDetail || "";
        const tips = /Tips:\s*([\s\S]*)/i.exec(detail)?.[1]?.split("Difficulty:")[0]?.trim() || "";
        const description = detail.split("Tips:")[0]?.trim() || "";
        const difficulty = /Difficulty:\s*(Easy|Medium|Hard)/i.exec(detail)?.[1] || "";

        return {
            ...q,
            description,
            tips,
            difficulty,
        };
    };

    // ------------------------------------------------
    // FETCH QUESTIONS
    // ------------------------------------------------
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError("");
        setSelected(null);

        try {
            const data = await api.questions.listByCompany(
                company,
                currentPage,
                QUESTIONS_PER_PAGE,
                sortOrder
            );

            let rawQuestions = [];
            let totalQ = 0;
            let totalP = 1;

            if (Array.isArray(data)) {
                // Handle legacy backend response
                rawQuestions = data;
                totalQ = data.length;
                totalP = 1;
            } else if (data && Array.isArray(data.questions)) {
                // Handle new paginated response
                rawQuestions = data.questions;
                totalQ = data.totalQuestions || 0;
                totalP = data.totalPages || 1;
            }

            const parsedQuestions = rawQuestions.map(parseQuestionDetail);

            setQuestions(parsedQuestions);
            setTotalPages(totalP);
            setTotalQuestions(totalQ);

        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message || "Failed to load questions.");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [company, currentPage, sortOrder]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // ------------------------------------------------
    // HANDLERS
    // ------------------------------------------------
    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    const handleSelectQuestion = (q) => {
        setSelected(q);
        setActiveTab("question");
    };

    const handleEditSubmit = async (formData) => {
        if (!token) return alert("You must be logged in.");
        try {
            await api.questions.update(token, selected._id, formData);
            alert("Experience updated successfully!");
            setShowEditModal(false);
            fetchQuestions();
            // Update local selection to reflect changes immediately
            setSelected(prev => parseQuestionDetail({ ...prev, ...formData }));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async () => {
        if (!token) return alert("You must be logged in.");
        if (window.confirm("Delete this experience?")) {
            try {
                await api.questions.remove(token, selected._id);
                alert("Deleted successfully!");
                fetchQuestions();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // ------------------------------------------------
    // PAGINATION RENDER FUNCTION
    // ------------------------------------------------
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const items = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - Math.floor(maxPagesToShow / 2);
            endPage = currentPage + Math.floor(maxPagesToShow / 2);
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        return (
            <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                />
                {items}
                <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        );
    };

    // Permission check
    const canEdit = user && selected && (user.email === selected.userEmail);

    return (
        <div className="question-list-container row">
            {/* LEFT SIDE: LIST */}
            <div className="col-md-5">
                <div className="question-list-container card p-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fw-semibold mb-0">
                            Questions ({totalQuestions})
                        </h4>

                        <Form.Group style={{ width: '150px' }}>
                            <Form.Select
                                value={sortOrder}
                                onChange={handleSortChange}
                                aria-label="Sort questions"
                                size="sm"
                            >
                                <option value="recent">Sort: Latest</option>
                                <option value="oldest">Sort: Oldest</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    {loading ? (
                        <p className="text-center text-muted py-4">Loading questions...</p>
                    ) : questions.length === 0 ? (
                        <p className="text-center text-muted py-4">No questions found. Be the first to add one!</p>
                    ) : (
                        <ul className="list-unstyled list-group question-list">
                            {questions.map((q) => (
                                <li
                                    key={q._id}
                                    className={`list-group-item list-group-item-action ${selected?._id === q._id ? 'active' : ''}`}
                                    onClick={() => handleSelectQuestion(q)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-medium">{q.questionTitle}</span>
                                        {q.difficulty && (
                                            <Badge bg={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'} className="text-uppercase ms-1">
                                                {q.difficulty}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="small text-muted mt-1">
                                        {/* 💡 FIX: Prioritize username, else fall back to email or Anonymous */}
                                        {q.role} • {q.username || (q.userEmail ? q.userEmail.split('@')[0] : 'Anonymous')}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {renderPagination()}
                </div>
            </div>

            {/* RIGHT SIDE: DETAIL */}
            <div className="col-md-7">
                {selected ? (
                    <div className="card question-detail-card p-4 shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold mb-0">{selected.questionTitle}</h3>
                            {canEdit && (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <FiEdit2 className="me-1" /> Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                        onClick={handleDelete}
                                    >
                                        <FiTrash2 className="me-1" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav variant="pills" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="question">Question</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tips">Tips</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane eventKey="question">
                                    <div className="mb-3">
                                        <span className="fw-bold">Role: </span> {selected.role || "N/A"}
                                        <span className="mx-2">|</span>
                                        <span className="fw-bold">Difficulty: </span>
                                        {selected.difficulty || "N/A"}
                                    </div>
                                    <hr />
                                    <div style={{ whiteSpace: "pre-wrap" }}>
                                        {selected.description || "No description provided."}
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="tips">
                                    <h5 className="fw-bold">Advice / Tips</h5>
                                    <div style={{ whiteSpace: "pre-wrap" }}>
                                        {selected.tips || "No tips shared."}
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                ) : (
                    <div className="placeholder text-center text-muted p-5 bg-light rounded shadow-sm h-100 d-flex align-items-center justify-content-center">
                        <div>
                            <p className="mb-0 fs-5">📝</p>
                            <p>Select a question from the list to view details.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            {selected && (
                <AddExperienceModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditSubmit}
                    initialData={selected}
                />
            )}
        </div>
    );
}

QuestionList.propTypes = {
    company: PropTypes.string.isRequired,
    token: PropTypes.string,
    user: PropTypes.object,
};