import React from "react";
import{Form} from 'react-bootstrap'

function Footer() {
  return (
    <footer className="footer mt-auto py-5 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5 style={{fontFamily:'Open Sans, sans-serif'}}>Contact Us</h5>
            <p>Email: info@soil.com</p>
            <p>Phone: 123-456-7890</p>
            <p>Address: 123 Soil Street, Melbourne, VIC 3000</p>
          </div>
          <div className="col-md-4">
            <h5 style={{fontFamily:'Open Sans, sans-serif'}}>Follow Us </h5>
            <ul className="list-unstyled">
              {/*<a href="https://www.flaticon.com/free-icons/facebook" title="facebook icons">Facebook icons created by Freepik - Flaticon</a>*/}
              <li>  
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/facebook-circular-logo.png" url="/https://www.facebook.com" alt="Search" style={{ width: '24px', height: '24px' }} />
              </a> 
              </li>
              {/*<a href="https://www.flaticon.com/free-icons/brands-and-logotypes" title="brands and logotypes icons">Brands and logotypes icons created by Freepik - Flaticon</a>*/}
              <li>  
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/twitter.png" url="/https://www.twitter.com" alt="Search" style={{ width: '24px', height: '24px' }} />
              </a> 
              </li>
              {/*<a href="https://www.flaticon.com/free-icons/instagram-logo" title="instagram logo icons">Instagram logo icons created by Freepik - Flaticon</a>*/}
              <li>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/instagram.png" url="/https://www.instagram.com" alt="Search" style={{ width: '24px', height: '24px' }} />
              </a> 
              </li>
            </ul>
          </div>
        <div className="col-md-4">
            <h5 style={{ fontFamily: 'Open Sans, sans-serif' }}>Subscribe</h5>
            <p>Register your interest and be the first to know about our sales and offers.</p>
         <Form>   
        <Form.Group className="mb-3" controlId="userEmail">
          <Form.Control type="email" name="email" placeholder="Email Address" required style={{ borderRadius: '15px'}}/>
        </Form.Group>
        <button type="submit" className="btn btn-dark w-100">Sign Up</button>
        </Form>   
            </div>
          </div>
        </div>
        <hr />
        <p className="text-center text-dark" style={{ fontFamily: 'Roboto, sans-serif' }}>Copyright &copy; {new Date().getFullYear()} SOIL.  All rights reserved.</p>
    </footer>
  );
}

export default Footer;
