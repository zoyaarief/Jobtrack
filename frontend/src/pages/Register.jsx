import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

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
      <div className='container py-5'>
         <div className='row justify-content-center'>
            <div className='col-12 col-sm-10 col-md-8 col-lg-6'>
               <Card className='shadow-sm border-0'>
                  <Card.Body className='p-4 p-md-5'>
                     <h1 className='h4 mb-4 text-center'>
                        Create your account
                     </h1>
                     {error && <Alert variant='danger'>{error}</Alert>}
                     {success && <Alert variant='success'>{success}</Alert>}
                     <Form onSubmit={handleSubmit} className='row g-3'>
                        <div className='col-12 col-md-6'>
                           <Form.Label>First name</Form.Label>
                           <Form.Control
                              value={form.firstName}
                              onChange={(e) =>
                                 updateField("firstName", e.target.value)
                              }
                              required
                           />
                        </div>
                        <div className='col-12 col-md-6'>
                           <Form.Label>Last name</Form.Label>
                           <Form.Control
                              value={form.lastName}
                              onChange={(e) =>
                                 updateField("lastName", e.target.value)
                              }
                              required
                           />
                        </div>
                        <div className='col-12 col-md-6'>
                           <Form.Label>Username</Form.Label>
                           <Form.Control
                              value={form.username}
                              onChange={(e) =>
                                 updateField("username", e.target.value)
                              }
                              required
                           />
                        </div>
                        <div className='col-12 col-md-6'>
                           <Form.Label>Email</Form.Label>
                           <Form.Control
                              type='email'
                              value={form.email}
                              onChange={(e) =>
                                 updateField("email", e.target.value)
                              }
                              required
                           />
                        </div>
                        <div className='col-12'>
                           <Form.Label>Password</Form.Label>
                           <Form.Control
                              type='password'
                              value={form.password}
                              onChange={(e) =>
                                 updateField("password", e.target.value)
                              }
                              required
                           />
                        </div>
                        <div className='col-12'>
                           <Button
                              type='submit'
                              className='w-100'
                              disabled={loading}
                           >
                              {loading ? "Creating…" : "Create account"}
                           </Button>
                        </div>
                     </Form>
                     <p className='text-center text-secondary small mt-3 mb-0'>
                        Already have an account?{" "}
                        <Link to='/login'>Sign in</Link>
                     </p>
                  </Card.Body>
               </Card>
            </div>
         </div>
      </div>
   );
}
