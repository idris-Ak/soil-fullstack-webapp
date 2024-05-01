import React from "react";
import { Link, useNavigate } from "react-router-dom";


function NavigationBar ({isLoggedIn}) {
  const navigate = useNavigate();

  const handleDietPlanClick = () => {
    //If the user is logged in, navigate them to the diet planner page
    if(isLoggedIn) {
      navigate('/dietPlan')
    }
    else{
      //If not, alert them to log in by navigating them to the login page
      alert('Please log in to access the diet planner.');
      navigate('/Login');
    }
  }; 
  
  return (
    <nav className="navbar navbar-expand-lg" style={{ fontFamily: 'Lato, sans-serif', fontSize: '18px', backgroundColor: '#F7F7F7', position: 'fixed', top: '120px',
     width: '100%', borderBottom: '1px solid #ddd', zIndex: 1030, padding: '0px'}}>
      <div className="container-fluid">
          {/*Implement navbar toggler if user has smaller screen*/}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
         aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" style={{fontWeight: 'bold'}} id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
            <Link className="nav-link" to="/" style={{margin: '0 20px' }}>Home</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/specials" style={{margin: '0 20px' }}>Specials</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/Shop" style={{margin: '0 20px' }}>Products</Link>
            </li>
            <li className="nav-item">
            <button onClick={handleDietPlanClick} className="nav-link" style={{margin: '0 20px' }}>Diet Planner</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
