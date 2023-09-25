import React, { useState } from "react";
import { Navbar, Nav, Button, Modal, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios

const NavbarComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({ username: "", password: "" });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Implement logout logic here (e.g., make an API request to log the user out on the server).
      // After successful logout, update the state.
      setIsLoggedIn(false);
      navigate("/login"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRegister = async () => {
    try {
      // Make an API request to register the user
      const response = await axios.post("http://localhost:5000/register",{username : registrationData.username, password : registrationData.password});
      console.log(response);
      if (response.status === 200) {
        setIsLoggedIn(true); // Update the state if registration is successful.
        setShowRegisterModal(false); // Close the modal.
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      // Make an API request to log the user in
      console.log(loginData);
      const response = await axios.post("http://localhost:5000/login", {username:loginData.username,password:loginData.password});
      
      if (response.status === 200) {
        setIsLoggedIn(true); // Update the state if login is successful.
        setShowLoginModal(false); // Close the modal.
      }
    } catch (error) {
      alert("Please try again with valid username and password");
      console.error("Error:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">
        My App
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
          {isLoggedIn ? (
            <>
              <Nav.Link as={Link} to="/dashboard">
                Dashboard
              </Nav.Link>
              <Button variant="link" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Nav.Link onClick={() => setShowRegisterModal(true)}>Register</Nav.Link>
              <Nav.Link onClick={() => setShowLoginModal(true)}>Login</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>

      {/* Registration Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="registerUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={registrationData.username}
                onChange={(e) =>
                  setRegistrationData({ ...registrationData, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={registrationData.password}
                onChange={(e) =>
                  setRegistrationData({ ...registrationData, password: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleRegister}>
            Register
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
};

export default NavbarComponent;
