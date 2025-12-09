// src/pages/InterviewHub.jsx

import React, { useState, useEffect } from "react";
import CompanySearch from "../components/CompanySearch.jsx";
import QuestionList from "../components/QuestionList.jsx";
import AddExperienceModal from "../components/AddExperienceModal.jsx";
import PropTypes from "prop-types";
import "../css/InterviewHub.css";
import { api } from "../api.js";
import { FiPlusCircle, FiSearch } from "react-icons/fi";

// --- LOGO FALLBACK HELPER FUNCTIONS ---
function stringToHslColor(str, s, l) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function getInitialsAndColor(companyName) {
  // Safety check for empty names
  if (!companyName) return { initials: "?", color: "#ccc" };

  const parts = companyName.split(/\s+/).filter((p) => p.length > 0);
  let initials = "";

  if (parts.length > 1) {
    initials = parts[0][0] + parts[1][0];
  } else if (parts.length === 1) {
    initials = parts[0].substring(0, 2);
  }

  initials = initials.toUpperCase();
  const color = stringToHslColor(companyName, 50, 60);

  return { initials, color };
}

// --- MAIN COMPONENT ---
export default function InterviewHub({ isAuthed, token, user }) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [logoFallbacks, setLogoFallbacks] = useState({});

  // Key used to force QuestionList to refresh its data
  const [questionRefreshKey, setQuestionRefreshKey] = useState(0);

  async function loadCompanies(search = "") {
    setLoading(true);
    setError("");
    try {
      const url = search
        ? `/api/companies?search=${encodeURIComponent(search)}`
        : "/api/companies";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      setCompanies(data || []);
      setHasResults(data.length > 0);

      setLogoFallbacks({});
    } catch (err) {
      setError(err.message || "Failed to load companies.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies(searchQuery);
  }, [searchQuery]);

  const handleSubmit = async (formData) => {
    setShowModal(false);
    setError("");

    if (!token) {
      setError("Authentication failed. Please log in again.");
      return;
    }

    try {
      const res = await api.questions.create(token, formData);
      if (res.insertedId) {
        const newCompany = formData.company;

        // Refresh list and navigate to the new company
        loadCompanies(searchQuery);

        if (newCompany === selectedCompany) {
          setQuestionRefreshKey((prev) => prev + 1);
        } else {
          setSelectedCompany(newCompany);
          setQuestionRefreshKey((prev) => prev + 1);
        }
      } else {
        setError(res.message || "Failed to add experience.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    }
  };

  function handleSearch(query) {
    setSearchQuery(query);
    setSelectedCompany("");
  }

  const handleLogoError = (e, companyName) => {
    e.target.onerror = null;
    e.target.style.display = "none";

    const fallbackData = getInitialsAndColor(companyName);
    setLogoFallbacks((prev) => ({
      ...prev,
      [companyName]: fallbackData,
    }));
  };

  // 💡 HELPER: Filter out bad data (empty names) so we don't get blank boxes
  const validCompanies = companies.filter(
    (c) => c.name && c.name.trim().length > 0,
  );

  // 💡 HELPER: If we are searching, show all matches. If not searching (Main Page), limit to 6.
  const displayedCompanies = searchQuery
    ? validCompanies
    : validCompanies.slice(0, 6);

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4 text-center">Interview Hub</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <CompanySearch onSearch={handleSearch} />

      <div className="d-flex justify-content-center mb-4 gap-3">
        {isAuthed ? (
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <FiPlusCircle /> Share Your Experience
          </button>
        ) : (
          <div className="alert alert-info text-center py-2">
            Log in to share your interview experience!
          </div>
        )}
      </div>

      {loading && !selectedCompany && (
        <div
          className="text-center text-muted mt-5"
          style={{ minHeight: "40vh" }}
        >
          Loading companies...
        </div>
      )}

      {!selectedCompany && validCompanies.length > 0 && !loading && (
        <div className="company-grid">
          {/* 💡 RENDER: Use the filtered and sliced list */}
          {displayedCompanies.map((c) => (
            <div key={c.name} className="company-card card shadow-sm">
              <div className="card-body text-center">
                {logoFallbacks[c.name] ? (
                  <div
                    className="company-logo-initials mb-2"
                    style={{
                      backgroundColor: logoFallbacks[c.name].color,
                      color: "#ffffff",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      margin: "0 auto",
                    }}
                  >
                    {logoFallbacks[c.name].initials}
                  </div>
                ) : (
                  <img
                    src={c.logo}
                    alt={`${c.name} logo`}
                    className="company-logo mb-2"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                    onError={(e) => handleLogoError(e, c.name)}
                  />
                )}

                <h5 className="card-title fw-semibold">{c.name}</h5>
                <p className="card-text text-muted">
                  {c.resourcesCount} resources
                </p>
                <button
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={() => setSelectedCompany(c.name)}
                >
                  View Resources
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCompany && (
        <>
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => setSelectedCompany("")}
          >
            ← Back to Companies
          </button>

          <QuestionList
            key={selectedCompany + questionRefreshKey}
            company={selectedCompany}
            token={token}
            user={user}
          />
        </>
      )}

      {!hasResults && !selectedCompany && !loading && (
        <div
          className="text-center text-muted mt-5"
          style={{ minHeight: "40vh" }}
        >
          <FiSearch size={30} className="mb-2" />
          <p>No results found for your search.</p>
        </div>
      )}

      <AddExperienceModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

InterviewHub.propTypes = {
  isAuthed: PropTypes.bool.isRequired,
  token: PropTypes.string,
  user: PropTypes.object,
};
