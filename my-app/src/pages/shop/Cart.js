import React from "react";
import './cart.css';
import { Link} from "react-router-dom";


function Cart({ cart, addToCart, removeFromCart }) {

  //this function retuns amount of items in cart
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
  //this function returns total price of cart
  function totalPrice(delivery){
    let total = 0;
    cart.map(item =>
      total = total + (item.quantity*item.price)
    )
    if(total <= 0){
      return 0;
    }
    // add shipping
    total = total + delivery;
    return total;
  }

  return (
    <div className="cart-container">
        <div className="card"> {/* Changed class name from "cart-container" to "card" */}
        <div className="col" style={{fontSize: '36px', marginTop: '10px', marginLeft: '5px'}}><b>Your Cart</b></div>
      {cart.length > 0 ? (
      <div className="row">
        <div className="col-md-8 cart">
          <div className="separator">
            <hr className="line" />
            <Link to='/cart' style={{ textDecoration: 'none', color: 'black' }}>
              <p><b>Cart</b></p>
            </Link>
            <hr className="line" />
            <Link to='/shipping' style={{ textDecoration: 'none', color: 'black' }}>
              <p>Shipping</p>
            </Link>
            <hr className="line" />
            <p>Payment</p>
            <hr className="line" />
            <p>Checkout</p>
            <hr className="line" />
          </div>
          {/* Render cart items dynamically */}
          {cart.map((item, index) => (
            <div key={index} className="row border-top border-bottom">
              <div className="row main align-items-center">
                <div className="col-2"><img className="img-fluid" src={item.img} alt={item.name} /></div> {/* Product image */}
                <div className="col"> {/* Column for product details */}
                  <div className="row" style={{ fontSize: '0.75rem' }}>{item.description}</div> {/* Product description */}
                </div>
                <div className="col"> {/* Column for quantity control */}
                  <button onClick={() => removeFromCart(item, 1)} style={{ cursor: 'pointer', backgroundColor: 'rgb(255, 0, 0)' }} className="rounded">-</button>
                  <a href="cart-border" className="cart-link border">{item.quantity}</a>
                  <button onClick={() => addToCart(item, 1)} style={{ cursor: 'pointer', backgroundColor: '#19ff21' }} className="rounded">+</button>
                </div>
                <div className="col">${(item.price * item.quantity).toFixed(2)} <span  className="close"><button  onClick={() => removeFromCart(item, item.quantity)}> &#10005;</button></span></div> {/* Product price */}
              </div>
            </div>
          ))}
        </div>
          <div className="col-md-4 summary">
          <div><h5><b>Summary</b></h5></div> {/* Summary title */}
          <hr />
          <div className="row"> {/* Row for summary details */}
            <div className="col" style={{ paddingLeft: '0' }} data-testid="item-count">ITEMS {cartAmount()}</div> {/* Number of items */}
            <div className="col text-right">${totalPrice(0).toFixed(2)}</div> {/* Total price */}
          </div>
          <form>
            <p>SHIPPING</p> {/* Shipping details */}
            <select>
              <option className="text-muted">Standard-Delivery- $5.00</option>
            </select> {/* Shipping options */}
            <p>REDEEM CODE</p> {/* Promo code section */}
            <input id="code" placeholder="Enter your code" />
          </form>
          <div className="row" style={{ borderTop: '1px solid rgba(0,0,0,.1)', padding: '2vh 0' }}> {/* Row for total price */}
            <div className="col">TOTAL PRICE</div> {/* Total price label */}
            <div className="col text-right">${totalPrice(5).toFixed(2)}</div> {/* Total price + shipping*/}
          </div>
          <Link to="/shipping"><button  className="btn">Proceed to Shipping</button></Link>{/*Checkout button*/}
          </div>
        </div>
        ) : (
          <div className="empty-cart">
            {/*<a href="https://www.flaticon.com/free-icons/empty-cart" title="empty cart icons">Empty cart icons created by Freepik - Flaticon</a>*/}
             <img src="/empty-cart.png" alt="Empty Cart" className="empty-cart-icon" style={{width: '100px', height: '100px', marginTop: '100px', marginBottom: '20px'}} />
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn back-to-shop-btn" style={{marginBottom: '60px', marginTop: '100px'}}>Continue Shopping</Link>
          </div>
        )}
      </div>
      </div>
  );
}

export default Cart;
