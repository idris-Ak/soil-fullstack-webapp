import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header ({user, logoutUser, isLoggedIn, cartItemCount}) {
  const navigate = useNavigate();
  
    const handleLogout = () => {
      logoutUser();
      navigate('/Login');
    };
  
    const handleCartClick = () => {
      //If the user is logged in, navigate them to the cart page
      if (isLoggedIn) {
        navigate('/Cart');
      } else {
        //If not, then alert them to log in by navigating them to the login page  
        alert('Please log in to view your cart.');
        navigate('/Login');
      }
    };


return (
  <header className="bg-white" style={{ position: 'fixed', top: 0, width: '100%', paddingTop: '10px', paddingBottom: '10px',  zIndex: 1030 }}>
  <div className="container-fluid d-flex justify-content-between align-items-center">
          {/*<a href="https://www.flaticon.com/free-icons/spinach" title="spinach icons">Spinach icons created by Freepik - Flaticon</a>*/}
          <Link className="navbar-brand" to="/" style={{ fontFamily: '"Merriweather", serif' }}>
            <img src="/spinach.png" alt="SOIL" style={{ width: '100px', height: '100px' }} />
            <span style={{ 
      fontFamily: '"Open Sans", sans-serif', 
      fontWeight: 'bold', 
      color: '#5C832F', 
      fontSize: '32px', 
      marginLeft: '10px',
      letterSpacing: '1px',
      }}>
      SOIL
      </span>
          </Link>
          <form className="d-flex" style={{ flex: 0.95, justifyContent: 'center' }}>
          <input className="form-control" type="search" placeholder="Search Products" aria-label="Search" style={{ height: '45px', marginRight: '5px' }} />
            <Link className="search-icon" to="/"> 
              <img src="/nature.png" alt="Search" style={{ width: '40px', height: '40px' }} />
            </Link> 
          </form>
          <div className="user-cart-links" style={{ fontFamily: 'Lato, sans-serif', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
            {/*<a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Freepik - Flaticon</a>*/}
            <Link className="nav-link act me-2" to="/myprofile" style={{marginRight: '20px'}}>
              <img src="/user.png" alt="Profile" style={{ width: '28px', height: '28px'}} />
            </Link>
            <span className="welcome-text" style={{ marginRight: '20px' }}>Welcome, {user?.name}</span>
             <button onClick={handleLogout} className="logout-button" style={{background: 'none', border: 'none'}}>Logout</button>
              </>
          ) : (
            <>
              {/*<a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Freepik - Flaticon</a>*/}
              <Link className="nav-link act" to="/login" style={{ display: 'flex', alignItems: 'center', marginLeft: '30px', marginRight: '30px' }}>
                <img src="/user.png" alt="Login" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <span style={{ marginLeft: '10px' }}>Login</span>
              </Link>
            </>
          )}
          <button onClick={handleCartClick} className="cart-button" style={{ marginLeft: '30px', background: 'none', border: 'none', padding: 0, marginRight: '20px'}}>
          <img src="/organic-product.png" alt="Shopping Cart" style={{ width: '50px', height: '50px' }} />
            </button>
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '30px',
                right: '20px',
                backgroundColor: 'green',
                color: 'white',
                borderRadius: '50%',
                padding: '5px 10px',
                fontSize: '0.6rem',
              }}>
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </header>
    );
  }

export default Header;
