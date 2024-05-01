import React from "react";
import './Checkout.css'
import { Link } from "react-router-dom";

function Checkout({ cart, removeFromCart }) {

  function cartAmount(){
    let numItems = 0;
    cart.map(items =>
      numItems += items.quantity 
      )
      if(numItems <= 0){
        return 0;
      }
    return numItems;
  }

  function totalPrice(delivery) {
    let total = 0;
    cart.forEach(item => {
      total += item.quantity * item.price;
    });
    // Add shipping cost
    total += delivery;
    return total;
  }
    // Retrieve checkoutDetails from localStorage
    let checkoutDetails = JSON.parse(localStorage.getItem('checkoutDetails'));

    // Check if checkoutDetails exists in localStorage
    if (!checkoutDetails) {
        // If not, initialize it as an empty object
        checkoutDetails = {};
    }

  let {address, city, country, card} = checkoutDetails;
  card = card.slice(-4);


  return (
    <div className="container-ch">
      <div className="row">
        <div className="col-md-8">
          {/* Cart section */}
          <div className="card-ch cart cart-container" style={{ width: '650px' }}>
            <div className="title-cart">CART</div>
            <div className="separator">
                <hr className="line" />
                <Link to='/cart' style={{ textDecoration: 'none', color: 'black' }}>
                    <p>Cart</p>
                </Link>
                <hr className="line" />
                <Link to='/shipping' style={{ textDecoration: 'none', color: 'black' }}>
                    <p>Shipping</p>
                </Link>
                <hr className="line" />
                <Link to='/Payment' style={{ textDecoration: 'none', color: 'black' }}>
                    <p>Payment</p>
                </Link>
                <hr className="line" />
                <Link to='/Checkout' style={{ textDecoration: 'none', color: 'black' }}>
                    <p><b>Checkout</b></p>
                </Link>
                <hr className="line" />
            </div>
            {cart.map((item, index) => (
              <div key={index} className="row border-top border-bottom">
                <div className="row main align-items-center">
                  <div className="col-2">
                    <img className="img-fluid" src={item.img} alt={item.name} />
                  </div>
                  <div className="col">
                    <div className="row text-muted">{item.title}</div>
                    <div className="row">{item.description}</div>
                  </div>
                  <div className="col">
                    <p className="cart-link border">{item.quantity}</p>
                  </div>
                  <div className="col">${item.price * item.quantity}
                    <span style={{ cursor: 'pointer' }} className="close">
                      <button onClick={() => removeFromCart(item, item.quantity)}>&#10005;</button>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          {/* Checkout summary */}
          <div className="container-ch checkout-summary">
            <div className="card-ch cart">
              <div className="title-checkout">CHECKOUT SUMMARY</div>
              <div className="steps">
                <div className="step">
                  <span>Total Items:</span>
                  <span>{cartAmount()}</span>
                </div>
                <hr />
                <div className="step">
                  <span>Subtotal:</span>
                  <span>${totalPrice(0).toFixed(2)}</span>
                </div>
                <div className="step">
                  <span>Shipping:</span>
                  <span>$5.00</span>
                </div>
                <div className="step">
                  <span>Address:</span>
                  <span>{address}, {city}, {country}</span>
                </div>
                <div className="step">
                  <span>Card Used:</span>
                  <span>**** **** **** {card}</span>
                </div>
              </div>
            </div>
            <div className="card-ch checkout">
              <div className="footer">
                <span className="price">Total: ${totalPrice(5).toFixed(2)}</span>
                <Link to="/Summary"> <button  className="checkout-btn">Checkout</button></Link>
              </div>
            </div>
          </div>        
          </div>
      </div>
    </div>
  );
}

export default Checkout;
