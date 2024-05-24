import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MyProfile from './pages/MyProfile';
import Specials from './pages/Specials';
import Shop from './pages/shop/Shop';
import Cart from './pages/shop/Cart';
import Shipping from './pages/checkout/shipping'
import Payment from './pages/checkout/Payment'
import Checkout from './pages/checkout/Checkout'
import Summary from './pages/checkout/Summary'
import DietPlan from './pages/dietPlan'
import { initCart, getUserCartID} from './repository/shopItems'; //Import shop items and functions
import axios from 'axios';


function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('isLoggedIn')));
  const [cart, setCart] = useState([]);
  const [cartID, setCartID] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);



const addToCart = async (newItem, amount) => {
  if (amount === 0) return;

  const cartItem = cart.find(item => item.productID === newItem.productID);
  
  if (cartItem) {
    const updatedQuantity = cartItem.quantity + amount;
    await updateCartItem(cartItem.cartItemID, updatedQuantity);
  } else {
    await addNewItemToCart(newItem, amount);
  }
};

const addNewItemToCart = async (item, quantity) => {
  try {
    const response = await axios.post("http://localhost:4000/api/cartItem", {
      cartID: cartID,
      productID: item.productID,
      quantity,
      price: item.price
    });
    if (response.status === 200) {
      setCart([...cart, { ...item, quantity, cartItemID: response.data.cartItemID }]);
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
  }
};

const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axios.put(`http://localhost:4000/api/cartItem/${itemId}`, { quantity });
    if (response.status === 200) {
      setCart(cart.map(item => item.cartItemID === itemId ? { ...item, quantity } : item));
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
  }
};

const removeFromCart = async (removeItem, amount) => {
  const updatedCart = cart.reduce((acc, item) => {
    if (item.cartItemID === removeItem.cartItemID) {
      const updatedQuantity = item.quantity - amount;
      if (updatedQuantity > 0) {
        updateCartItem(item.cartItemID, updatedQuantity);
        acc.push({ ...item, quantity: updatedQuantity });
      } else {
        deleteCartItem(item.cartItemID);
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);

  setCart(updatedCart);
};

const deleteCartItem = async (itemId) => {
  try {
    const response = await axios.delete(`http://localhost:4000/api/cartItem/${itemId}`);
    if (response.status === 200) {
      setCart(cart.filter(item => item.cartItemID !== itemId));
    }
  } catch (error) {
    console.error('Error deleting cart item:', error);
  }
};



  const removeAllFromCart = async () => {
    const deletePromises = cart.map(item => deleteCartItem(item.cartItemID));
    await Promise.all(deletePromises);
    setCart([]);
    console.log("removeAll From Cart executed", cart);
  };


  useEffect(() => {
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(cartItemCount); // Reset the cart count to 0

  } ,[cart])

  useEffect(() => {
    
    const initializeCartAndFetchID = async () => {
      if (currentUser) {
        // Initialize the cart
        console.log("initCart 2 called");
        const storedCart = await initCart(currentUser);
        if (Array.isArray(storedCart)) {
          setCart(storedCart);
        } else {
          console.log("Cart retrieved was not an array, cart set to null");
          setCart([]);
        }
  
        // Fetch the cart ID
        console.log("getUserCartID called");
        const retrievedCartID = await getUserCartID(currentUser);
        setCartID(retrievedCartID);
      }
    };
    console.log("initializeCartAndFetchID");
    initializeCartAndFetchID();
  }, [currentUser]);



  
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);
  
  //Update local storage whenever cart changes
  useEffect(() => {
    if (isMounted) {
      // localStorage.setItem("cart", JSON.stringify(cart));
      // updateCart(cart,user);
    }
  }, [cart, isMounted]);

  const loginUser = async (userDetails) => {
    try {
      const response = await axios.post('http://localhost:4000/api/user/Login', userDetails);
      if (response.status === 200 && response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        setCurrentUser(response.data.user);
        setIsLoggedIn(true);

        return response;
      } else {
        throw new Error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error.response?.data.message || "No error message from server");
      throw error;
    }
  };


  const updateCart = async () =>{
    const storedCart = await initCart(null);
    setCart(storedCart);
    console.log("after logout",storedCart);

  }
  const logoutUser = async () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
    setIsLoggedIn(false);
    await updateCart();
  //Reset the meal plan to a blank state

    localStorage.setItem('mealPlan', JSON.stringify([]));
  };

  //Update user details upon editing them in the profile page
  const updateCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };



  return (
    <div>
      <Router>
        {/* props for Header component */}
        <Header user={currentUser} logoutUser={logoutUser} isLoggedIn={isLoggedIn} cartItemCount={cartItemCount}/>
        <NavigationBar isLoggedIn={isLoggedIn}/>
        <main role="main" style={{paddingTop: '170px'}}>
          <div className="container-fluid my-3">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login loginUser={loginUser} />} />
              <Route path="/signup" element={<SignUp loginUser={loginUser} />} />
              <Route path="/myprofile" element={<MyProfile currentUser={currentUser} updateCurrentUser={updateCurrentUser} logoutUser={logoutUser} />} />
              <Route path="/specials" element={<Specials addToCart={addToCart} isLoggedIn={isLoggedIn}/>} />
              <Route path="/shop" element={<Shop addToCart={addToCart} isLoggedIn={isLoggedIn} currentUser={currentUser} />} />
              <Route path="/cart" element={<Cart cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}/>} />
              <Route path="/shipping" element={<Shipping />}/>
              <Route path="/Payment" element={<Payment />}/>
              <Route path="/Checkout" element={<Checkout cart={cart}  removeFromCart={removeFromCart}/>}/>
              <Route path="/Summary" element={<Summary cart={cart} removeAllFromCart={removeAllFromCart}/>}/>
              <Route path="dietPlan" element={<DietPlan />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
