import React, { useState } from "react";
import PropTypes from "prop-types";

export default function CompanySearch({ onSearch }) {
    const [query, setQuery] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length === 0) return; // prevent empty search
        onSearch(trimmed);
    }

    function clearSearch() {
        setQuery("");
        onSearch(""); // optional: resets list
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="d-flex justify-content-center align-items-center mt-3 mb-4 gap-2"
            role="search"
            aria-label="Company search"
        >
            <input
                type="text"
                className="form-control w-50"
                placeholder="🔍 Search for a company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search companies"
            />

            <button type="submit" className="btn btn-primary">
                Search
            </button>

            {query.length > 0 && (
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearSearch}
                    aria-label="Clear search"
                >
                    Clear
                </button>
            )}
        </form>
    );
}

CompanySearch.propTypes = {
    onSearch: PropTypes.func.isRequired,
};
