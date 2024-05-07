import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Button, Form, Alert, Container } from 'react-bootstrap';


function Login({loginUser}) {
//These states are based upon the states from the Week 2 Full Stack Development lectorial code for cosc2758 semester 1, 2024
const[userDetails, setUserDetails] = useState({email:'', password:''}); 
//Add an error message state
const [errorMessage, setErrorMessage] = useState('');
const[showErrorMessage, setShowErrorMessage] = useState(false);
const[showSuccessAlert, setShowSuccessAlert] = useState(false);
const navigate = useNavigate();

const handleChange = (event) => {
 const{name, value} = event.target;
  setUserDetails((prevUserDetails) => ({
    ...prevUserDetails, [name]: value
  }));
}; 

const handleSubmit = async (event) => {
  event.preventDefault();
  setShowErrorMessage(false);
  try {
      //Attempt to login
      const response = await loginUser(userDetails, navigate);
      if (response.data.user) {
          setShowSuccessAlert(true);
          setTimeout(() => {
            setShowSuccessAlert(false);
            //Redirect to profile after alert has been shown for 2.5 seconds
            navigate('/MyProfile');
        }, 2500);
      } 
      else {
          throw new Error('Login unsuccessful');
      }
  } catch (error) {
      //Handle any errors that occur during login
      setErrorMessage(error.response?.data.message || 'Invalid email or password');
      setShowErrorMessage(true);
      //Hide error alerts after 2.5 seconds
      setTimeout(() => setShowErrorMessage(false), 2500);
      //Reset the password field only after an unsuccessful login attempt
      setUserDetails(prevDetails => ({ ...prevDetails, password: '' }));
  }
};

return(
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh', fontFamily: 'Lato, sans-serif'}}>
  <div className="w-100 p5" style={{ maxWidth: '600px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1'}}>
  {showErrorMessage && errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
  {showSuccessAlert && <Alert variant="success">Login Successful!</Alert>}
      <Form onSubmit={handleSubmit} className="p-5">
    <h2 className="mb-4 text-center" style={{ fontWeight: '700', color: '#333', fontFamily: 'Lato, sans-serif', fontSize: '40px'}}>Login</h2>
        <Form.Group controlId='userEmailLogin' className="mb-4" style={{fontSize: '20px'}}>
          <Form.Control type="email" name="email" value={userDetails.email} placeholder="Email Address" onChange={handleChange} required className="py-2"/>
        </Form.Group>
        <Form.Group controlId='userPassword' className="mb-4" style={{fontSize: '20px'}}>
           <Form.Control type="password" name = "password" placeholder="Password" value={userDetails.password} onChange={handleChange} required className="py-2" />
        </Form.Group>
      <Button variant='outline-primary' type="submit"  className="w-100 mt-2 rounded-pill" style={{ fontWeight: '600', fontSize: '22px'}}>
        Login
      </Button>
      <div className = "mt-3 text-center" style={{fontSize: '18px'}}>
          Don't have an account? <Link to="/SignUp" style={{fontWeight: '700', color: '#007bff'}}>SignUp</Link>
        </div>
    </Form>
  </div>
  </Container>
);
}

export default Login; 