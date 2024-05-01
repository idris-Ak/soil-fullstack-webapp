const ITEMS = "items";
const CART = "cart"

// Initialise local storage "users" with data, if the data is already set this function returns immediately.
function initItems() {
  // Stop if data is already initialised.
  if(localStorage.getItem(ITEMS) !== null)
    return;

  // Define hardcoded shop items array  properties including id, name, price, and special status.
  const hardcodedShopItems = [
    //OpenAI (2024) ChatGPT [Large language model], accessed 1 April 2024. (*Link could not be generated successfully*)
    { id: 1, name: 'Organic Apples', price: 4, special: true, img: 'organic_apples.jpg', title: 'Organic Apples', link: '#', description: 'Crisp and fresh organic apples.', category: 'Fruits' },
    { id: 2, name: 'Organic Carrots', price: 3, special: false, img: 'organic_carrots.jpg', title: 'Organic Carrots', link: '#', description: 'Sweet and crunchy organic carrots.', category: 'Vegetables' },
    { id: 3, name: 'Organic Tomatoes', price: 5, special: true, img: 'organic_tomatoes.jpg', title: 'Organic Tomatoes', link: '#', description: 'Juicy organic tomatoes perfect for salads and cooking.', category: 'Vegetables' },
    { id: 4, name: 'Organic Spinach', price: 4, special: true, img: 'organic_spinach.jpg', title: 'Organic Spinach', link: '#', description: 'Fresh and tender organic spinach leaves.', category: 'Vegetables' },
    { id: 5, name: 'Organic Kale', price: 4, special: true, img: 'organic_kale.jpg', title: 'Organic Kale', link: '#', description: 'Nutrient-rich organic kale for healthy meals.', category: 'Vegetables' },
    { id: 6, name: 'Organic Eggs', price: 6, special: false, img: 'organic_eggs.jpg', title: 'Organic Eggs', link: '#', description: 'Free-range organic eggs with a rich taste.', category: 'Dairy & Eggs' },
    { id: 7, name: 'Organic Milk', price: 3.5, special: false, img: 'organic_milk.jpg', title: 'Organic Milk', link: '#', description: 'Creamy organic milk from grass-fed cows.', category: 'Dairy & Eggs' },
    { id: 8, name: 'Organic Cheese', price: 8, special: false, img: 'organic_cheese.jpg', title: 'Organic Cheese', link: '#', description: 'Delicious organic cheese made from organic milk.', category: 'Dairy & Eggs' },
    { id: 9, name: 'Organic Bread', price: 5, special: false, img: 'organic_bread.jpg', title: 'Organic Bread', link: '#', description: 'Whole grain organic bread, freshly baked.', category: 'Bakery' },
    { id: 10, name: 'Organic Chicken', price: 12, special: true, img: 'organic_chicken.jpg', title: 'Organic Chicken', link: '#', description: 'Tender and flavorful organic chicken.', category: 'Meat & Seafood' },
    { id: 11, name: 'Organic Quinoa', price: 7, special: false, img: 'organic_quinoa.jpg', title: 'Organic Quinoa', link: '#', description: 'High-quality organic quinoa, perfect for healthy dishes.', category: 'Grains & Pasta' },
    { id: 12, name: 'Organic Blueberries', price: 6, special: true, img: 'organic_blueberries.jpg', title: 'Organic Blueberries', link: '#', description: 'Sweet and juicy organic blueberries, great for snacking or baking.', category: 'Fruits' },
    { id: 13, name: 'Organic Avocados', price: 5, special: false, img: 'organic_avocados.jpg', title: 'Organic Avocados', link: '#', description: 'Creamy and nutritious organic avocados.', category: 'Fruits' },
    { id: 14, name: 'Organic Sweet Potatoes', price: 4, special: false, img: 'organic_sweet_potatoes.jpg', title: 'Organic Sweet Potatoes', link: '#', description: 'Delicious and healthy organic sweet potatoes.', category: 'Vegetables' },
    { id: 15, name: 'Organic Almond Butter', price: 10, special: false, img: 'organic_almond_butter.jpg', title: 'Organic Almond Butter', link: '#', description: 'Smooth and creamy organic almond butter.', category: 'Nuts & Seeds' },
    { id: 16, name: 'Organic Chia Seeds', price: 8, special: true, img: 'organic_chia_seeds.jpg', title: 'Organic Chia Seeds', link: '#', description: 'Nutrient-packed organic chia seeds for your daily diet.', category: 'Nuts & Seeds' },
    { id: 17, name: 'Organic Bananas', price: 3, special: false, img: 'organic_bananas.jpg', title: 'Organic Bananas', link: '#', description: 'Sweet and nutritious organic bananas.', category: 'Fruits' },
    { id: 18, name: 'Organic Oranges', price: 4, special: false, img: 'organic_oranges.jpg', title: 'Organic Oranges', link: '#', description: 'Juicy and vitamin-rich organic oranges.', category: 'Fruits' },
    { id: 19, name: 'Organic Strawberries', price: 5, special: true, img: 'organic_strawberries.jpg', title: 'Organic Strawberries', link: '#', description: 'Plump and sweet organic strawberries, perfect for desserts.', category: 'Fruits' },
    { id: 20, name: 'Organic Peaches', price: 6, special: false, img: 'organic_peaches.jpg', title: 'Organic Peaches', link: '#', description: 'Juicy and flavorful organic peaches.', category: 'Fruits' },
    { id: 21, name: 'Organic Grapes', price: 7, special: false, img: 'organic_grapes.jpg', title: 'Organic Grapes', link: '#', description: 'Sweet and refreshing organic grapes.', category: 'Fruits' },
    { id: 22, name: 'Organic Broccoli', price: 3.5, special: true, img: 'organic_broccoli.jpg', title: 'Organic Broccoli', link: '#', description: 'Fresh and nutritious organic broccoli.', category: 'Vegetables' },
    { id: 23, name: 'Organic Corn', price: 4, special: false, img: 'organic_corn.jpg', title: 'Organic Corn', link: '#', description: 'Versatile and delicious organic corn.', category: 'Vegetables'},
    { id: 24, name: 'Organic Cucumbers', price: 2.5, special: false, img: 'organic_cucumbers.jpg', title: 'Organic Cucumbers', link: '#', description: 'Crisp and hydrating organic cucumbers.', category: 'Vegetables' },
    { id: 25, name: 'Organic Bell Peppers', price: 3, special: true, img: 'organic_bell_peppers.jpg', title: 'Organic Bell Peppers', link: '#', description: 'Colorful and vitamin-packed organic bell peppers.', category: 'Vegetables' },
    { id: 26, name: 'Organic Potatoes', price: 2, special: false, img: 'organic_potatoes.jpg', title: 'Organic Potatoes', link: '#', description: 'Nutritious and versatile organic potatoes.', category: 'Vegetables' },
    { id: 27, name: 'Organic Onions', price: 1.5, special: false, img: 'organic_onions.jpg', title: 'Organic Onions', link: '#', description: 'Flavorful and aromatic organic onions.', category: 'Vegetables' },
    { id: 28, name: 'Organic Garlic', price: 2, special: false, img: 'organic_garlic.jpg', title: 'Organic Garlic', link: '#', description: 'Aromatic and healthful organic garlic.', category: 'Vegetables' },
    { id: 29, name: 'Organic Lettuce', price: 3, special: false, img: 'organic_lettuce.jpg', title: 'Organic Lettuce', link: '#', description: 'Crisp and refreshing organic lettuce.', category: 'Vegetables' },
    { id: 30, name: 'Organic Mushrooms', price: 4, special: false, img: 'organic_mushrooms.jpg', title: 'Organic Mushrooms', link: '#', description: 'Nutrient-rich organic mushrooms, perfect for various dishes.', category: 'Vegetables' }      // ... More organic food products
  ];
    
  // Set data into local storage.
  localStorage.setItem(ITEMS, JSON.stringify(hardcodedShopItems));
}

function getShopItems() {
  const data = localStorage.getItem(ITEMS);
  return JSON.parse(data);
}

function initCart() {
  if (localStorage.getItem(CART) === null) {
    localStorage.setItem(CART, JSON.stringify([]));
  }
}


function clearCart() {
  localStorage.setItem(CART, JSON.stringify([]));
}

function getCartItems() {
  initCart();
  return JSON.parse(localStorage.getItem(CART));
}

  // Function to retrieve special shop items
  export const getSpecialItems = () => {
    // Filter the shop items array to return only items marked as special
    const allItems = getShopItems();

    return allItems.filter(item => item.special);
  };
  
  export {
    initItems,
    getShopItems,
    initCart,
    clearCart,
    getCartItems
  };
