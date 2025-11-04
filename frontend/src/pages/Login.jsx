import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Login() {
   const [identifer, setIdentifer] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   async function handleSubmit(e) {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
         const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifer, password }),
         });

         const contentType = response.headers.get("content-type") || "";
         const isJson = contentType.includes("application/json");
         const data = isJson ? await response.json().catch(() => null) : null;

         if (!response.ok) {
            const message =
               (data && (data.message || data.error)) ||
               `Request failed (${response.status})`;
            throw new Error(message);
         }

         const token = data?.token;
         if (token) {
            // store token in local storage
            localStorage.setItem("token", token);
            // redirect to dashboard here
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
      <div className='container py-5'>
         <div className='row justify-content-center'>
            <div className='col-12 col-sm-10 col-md-7 col-lg-5'>
               <Card className='shadow-sm border-0'>
                  <Card.Body className='p-4 p-md-5'>
                     <h1 className='h4 mb-4 text-center'>Welcome back</h1>
                     {error && <Alert variant='danger'>{error}</Alert>}
                     <Form onSubmit={handleSubmit} className='vstack gap-3'>
                        <Form.Group>
                           <Form.Label>Email or Username</Form.Label>
                           <Form.Control
                              type='text'
                              value={identifer}
                              onChange={(e) => setIdentifer(e.target.value)}
                              placeholder='e.g. jdoe or jdoe@example.com'
                              required
                           />
                        </Form.Group>
                        <Form.Group>
                           <Form.Label>Password</Form.Label>
                           <Form.Control
                              type='password'
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                           />
                        </Form.Group>
                        <Button
                           type='submit'
                           className='w-100'
                           disabled={loading}
                        >
                           {loading ? "Signing in…" : "Sign in"}
                        </Button>
                     </Form>
                     <p className='text-center text-secondary small mt-3 mb-0'>
                        New here? <Link to='/register'>Create an account</Link>
                     </p>
                  </Card.Body>
               </Card>
            </div>
         </div>
      </div>
   );
}
