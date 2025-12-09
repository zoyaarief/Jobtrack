import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { api } from "../api.js";
import "../css/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.register(form);
      setSuccess("Account created. You can log in now.");
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="text-center mb-4">
            <div className="register-hero">
              <FiUser />
            </div>
            <h1 className="register-title">Join JobTrack Today</h1>
            <p className="register-subtitle">
              Create your account and start tracking your applications
            </p>
          </div>

          <Card className="card-modern">
            <Card.Body className="p-4">
              {error && (
                <Alert
                  variant="danger"
                  className="border-0"
                  style={{
                    background: "#f8d7da",
                    color: "#58151c",
                  }}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  variant="success"
                  className="border-0"
                  style={{
                    background: "#d1e7dd",
                    color: "#0f5132",
                  }}
                >
                  {success}
                </Alert>
              )}
              <Form onSubmit={handleSubmit} className="form-modern row">
                <div className="col-md-6 mb-3">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    value={form.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <Button
                    type="submit"
                    className="btn-modern btn-secondary-modern w-100"
                    disabled={loading}
                  >
                    {loading ? "Creating…" : "Create account"}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-4">
                <p className="text-secondary mb-0">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="fw-semibold"
                    style={{
                      color: "#667eea",
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#764ba2")}
                    onMouseLeave={(e) => (e.target.style.color = "#667eea")}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
