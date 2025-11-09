import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [identifer, setIdentifer] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ identifer, password });
      const token = res.token;
      if (token) {
        onLogin(token);
        navigate("/dashboard", { replace: true });
      } else {
        setError("No token returned from server");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <h1 className="h4 mb-4 text-center">Welcome back</h1>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit} className="vstack gap-3">
                <Form.Group>
                  <Form.Label>Email or Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={identifer}
                    onChange={(e) => setIdentifer(e.target.value)}
                    placeholder="e.g. jdoe or jdoe@example.com"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </Form>
              <p className="text-center text-secondary small mt-3 mb-0">
                New here? <Link to="/register">Create an account</Link>
              </p>
            </Card.Body>
          </Card>
        </div>
         </div>
      </div>
   );
}

Login.propTypes = {
   onLogin: PropTypes.func.isRequired,
};
