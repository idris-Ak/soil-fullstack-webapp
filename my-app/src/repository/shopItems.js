import axios from "axios";

const CART = "cart"

// retrieve all products from database 
const getShopItems = async () => {
  try {
      const result = await axios.get("http://localhost:4000/api/product");
      return result.data;
  } catch (error) {
      console.log("Error fetching data:", error);
  }
}

const initCart = async (User) => {
  

  let id = User.id;
  console.log("initCart: user id of:",id)
  try {
    const response = await axios.get("http://localhost:4000/api/shoppingCart", {
      params: {
        userID: id,
      },
    });
    const cart = response.data;
    if (cart.length > 0) {
      console.log("initCart: user has a cart was sucessful cartId",cart[0].cartID);
      return returnCart(cart[0].cartID);
      
    } else {
      console.log("initCart:  assign user cart, createCartForUser called");
      const newCart = await createCartForUser(User.id);
      if (newCart) {
        return [];
      }
    }
  } catch (error) {
    console.error('Error initializing cart:', error);
    return [];
  }
};

const createCartForUser = async (userId) => {
  try {
    await axios.post("http://localhost:4000/api/shoppingCart", {
      userID: userId
    });
    console.log("cart created for user", userId)
    return true;
  } catch (error) {
    console.error('Error creating cart for user:', error);
    return null;
  }
};


const returnCart = async (shoppingCartId) => {
  console.log("shoppingCartId is: ",shoppingCartId)

  try {  
    const response = await axios.get(`http://localhost:4000/api/cartItem/${shoppingCartId}`);

    if(response.data){
      return response.data;
    }
    else{
      return [];
    }
  } catch (error) {
    console.error('Error retrieving cart items:', error);
    return [];
  }
};

const getUserCartID = async (User) => {
  console.log(User.id);
  let id = User.id;
  try {  
    const response = await axios.get("http://localhost:4000/api/shoppingCart", {
      params: {
        userID: id,
      },
    });

    if (response.data) {
      console.log("Retrieving the user's cartID is a go", response.data[0].cartID);
      return response.data[0].cartID;
    } else {
      console.log("There seems to be an error retrieving the user's cartID");
      return null;
    }
  } catch (error) {
    console.error('Error retrieving the user\'s cartID:', error);
    return null;
  }
};



function clearCart() {
  localStorage.setItem(CART, JSON.stringify([]));
}

const updateCart = async () => {
  

}

  // Function to retrieve special shop items
  export const getSpecialItems = async () => {
    try {
      const result = await axios.get("http://localhost:4000/api/product/specials");
      return result.data;
  } catch (error) {
      console.log("Error fetching data:", error);
  }
}
  
  
  export {
    getShopItems,
    initCart,
    clearCart,
    returnCart,
    updateCart,
    getUserCartID
  };
