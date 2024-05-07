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
import { initItems } from './repository/shopItems'; //Import shop items and functions
import axios from 'axios';


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  //Function to add item to cart
  const addToCart = (newItem, amount) => {
    //if item exsist in cart conditional statement add to quantity to that item
    if(amount === 0){
      return;
    }
    if(cart.some(item => item.id === newItem.id)){
      const updatedCart = (cart.map (item =>
           item.id === newItem.id ? {...item, quantity: item.quantity + amount} : item
        )
      )
      setCart(updatedCart);
      return;
    }
    //adds item to cart with initilal quantity of 1
    setCart([
      ...cart,
      {...newItem, quantity:amount}
    ]);
  };

  // Function to remove item from cart
  const removeFromCart = (removeItem, amount) => {
    //removing one item at a time and if the item goes to 0 in quantity it is deleted
    const updatedCart = cart.reduce((acc, item) => {
      if (item.id === removeItem.id) {
        if (item.quantity > amount) {
          // Decrease quantity if more than one
          acc.push({ ...item, quantity: item.quantity - amount });
        }
        // If quantity is 1, do not add to the accumulator, effectively removing it
      } else {
        //Add item to accumulator if not the item to remove
        acc.push(item);
      }
      return acc;
    }, []);

    setCart(updatedCart);
  };
  const removeAllFromCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    console.log("removeAll From Cart executed");
  };

  useEffect(() => {
    //initialize the shop products
    initItems();
    if (!isMounted) {
      setIsMounted(true);
      //Retrieve cart data from local storage
      const storedCart = JSON.parse(localStorage.getItem("cart"));
    
      //Check if there's any cart data in local storage
      if (storedCart) {
        setCart(storedCart);
      } else {
        //If no cart data found, initialize cart state to an empty array
        setCart([]);
      }
    }
  }, [isMounted]);
  
  //Update local storage whenever cart changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const loginUser = async (userDetails) => {
    try {
      //Try to get connection with api
        const response = await axios.post('http://localhost:4000/api/user/Login', userDetails);
        //If the user successfully logs in then update the states
        if (response.status === 200 && response.data.user) {
            setCurrentUser(response.data.user);
            setIsLoggedIn(true);
            return response;
        } else {
            //If the status code is not 200, output an error
            throw new Error(response.data.message || "Invalid credentials");
        }
    } catch (error) {
        console.error('Login error:', error.response?.data.message || "No error message from server");
        throw error; // Rethrow the error to handle it in the calling function
    }
};

  useEffect(() => {
    if (!isMounted) {
    setIsMounted(true);
    }
  }, [isMounted]);

  const logoutUser = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    //Reset the meal plan to a blank state
    localStorage.setItem('mealPlan', JSON.stringify([]));
  };

  //Update user details upon editing them in the profile page
  const updateCurrentUser = (user) => {
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
              <Route path="/shop" element={<Shop addToCart={addToCart} isLoggedIn={isLoggedIn}/>} />
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
