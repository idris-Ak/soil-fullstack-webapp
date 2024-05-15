const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config.js");

const db = {
  Op: Sequelize.Op
};

// Create Sequelize.
db.sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
});

// Include models.
// exapamples below
// db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.admin = require("./models/admin.js")(db.sequelize, DataTypes);
db.shoppingCart = require("./models/shoppingCart.js")(db.sequelize, DataTypes);
db.cartItem = require("./models/cartItem.js")(db.sequelize, DataTypes);
db.review = require("./models/review.js")(db.sequelize, DataTypes);
db.follow = require("./models/follow.js")(db.sequelize, DataTypes);
db.product = require("./models/product.js")(db.sequelize, DataTypes);
db.adminActions = require("./models/adminActions.js")(db.sequelize, DataTypes);
db.moderateReview = require("./models/moderateReview.js")(db.sequelize, DataTypes);

// Relate the models
// example of post and user below.
// db.post.belongsTo(db.user, { foreignKey: { name: "username", allowNull: false } });
db.user.hasOne(db.shoppingCart, { foreignKey: 'userID' });
db.user.hasMany(db.review, { foreignKey: 'userID', as: 'reviews' });
db.user.belongsToMany(db.user, {
  through: db.follow,
  as: 'Followers',
  foreignKey: 'followingID',
  otherKey: 'followerID'
});
db.user.belongsToMany(db.user, {
  through: db.follow,
  as: 'Following',
  foreignKey: 'followerID',
  otherKey: 'followingID'
});

db.admin.hasMany(db.adminActions, { foreignKey: 'adminID' });
db.admin.hasMany(db.moderateReview, { foreignKey: 'adminID' });

db.shoppingCart.belongsTo(db.user, { foreignKey: 'userID' });
db.shoppingCart.hasMany(db.cartItem, { foreignKey: 'cartID' });

db.cartItem.belongsTo(db.shoppingCart, { foreignKey: 'cartID' });
db.cartItem.belongsTo(db.product, { foreignKey: 'productID' });

db.product.hasMany(db.cartItem, { foreignKey: 'productID' });
db.product.hasMany(db.review, { foreignKey: 'productID' });

db.review.belongsTo(db.user, { foreignKey: 'userID', as: 'user' });
db.review.belongsTo(db.product, { foreignKey: 'productID' });
db.review.hasMany(db.moderateReview, { foreignKey: 'reviewID' });

db.moderateReview.belongsTo(db.admin, { foreignKey: 'adminID' });
db.moderateReview.belongsTo(db.review, { foreignKey: 'reviewID' });

db.adminActions.belongsTo(db.admin, { foreignKey: 'adminID' });

// Learn more about associations here: https://sequelize.org/master/manual/assocs.html

// Include a sync option with seed data logic included.
db.sync = async () => {
  // Sync schema.
  try {
        // Disable foreign key checks
        // await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
        // Sync the database
        await db.sequelize.sync();
        // await db.sequelize.sync({ alter: true });
        
        // Re-enable foreign key checks
        // await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        
    
    //Seed the database
    await seedData();
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

async function seedData() {
  const count = await db.product.count();

  // Only seed data if necessary.
  if(count > 0){
    console.log("Product count greater than 0 - no need to addProducts");
    return;
  }
    

  // below is an example of adding a user

  // const argon2 = require("argon2");

  // let hash = await argon2.hash("abc123", { type: argon2.argon2id });

  await db.product.create({ name: 'Organic Apples', price: 4, isSpecial: true, img: 'organic_apples.jpg', title: 'Organic Apples', description: 'Crisp and fresh organic apples.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Carrots', price: 3, isSpecial: false, img: 'organic_carrots.jpg', title: 'Organic Carrots', description: 'Sweet and crunchy organic carrots.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Tomatoes', price: 5, isSpecial: true, img: 'organic_tomatoes.jpg', title: 'Organic Tomatoes', description: 'Juicy organic tomatoes perfect for salads and cooking.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Spinach', price: 4, isSpecial: true, img: 'organic_spinach.jpg', title: 'Organic Spinach', description: 'Fresh and tender organic spinach leaves.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Kale', price: 4, isSpecial: true, img: 'organic_kale.jpg', title: 'Organic Kale', description: 'Nutrient-rich organic kale for healthy meals.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Eggs', price: 6, isSpecial: false, img: 'organic_eggs.jpg', title: 'Organic Eggs', description: 'Free-range organic eggs with a rich taste.', type: 'Dairy & Eggs' });
  await db.product.create({ name: 'Organic Milk', price: 3.5, isSpecial: false, img: 'organic_milk.jpg', title: 'Organic Milk', description: 'Creamy organic milk from grass-fed cows.', type: 'Dairy & Eggs' });
  await db.product.create({ name: 'Organic Cheese', price: 8, isSpecial: false, img: 'organic_cheese.jpg', title: 'Organic Cheese', description: 'Delicious organic cheese made from organic milk.', type: 'Dairy & Eggs' });
  await db.product.create({ name: 'Organic Bread', price: 5, isSpecial: false, img: 'organic_bread.jpg', title: 'Organic Bread', description: 'Whole grain organic bread, freshly baked.', type: 'Bakery' });
  await db.product.create({ name: 'Organic Chicken', price: 12, isSpecial: true, img: 'organic_chicken.jpg', title: 'Organic Chicken', description: 'Tender and flavorful organic chicken.', type: 'Meat & Seafood' });
  await db.product.create({ name: 'Organic Quinoa', price: 7, isSpecial: false, img: 'organic_quinoa.jpg', title: 'Organic Quinoa', description: 'High-quality organic quinoa, perfect for healthy dishes.', type: 'Grains & Pasta' });
  await db.product.create({ name: 'Organic Blueberries', price: 6, isSpecial: true, img: 'organic_blueberries.jpg', title: 'Organic Blueberries', description: 'Sweet and juicy organic blueberries, great for snacking or baking.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Avocados', price: 5, isSpecial: false, img: 'organic_avocados.jpg', title: 'Organic Avocados', description: 'Creamy and nutritious organic avocados.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Sweet Potatoes', price: 4, isSpecial: false, img: 'organic_sweet_potatoes.jpg', title: 'Organic Sweet Potatoes', description: 'Delicious and healthy organic sweet potatoes.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Almond Butter', price: 10, isSpecial: false, img: 'organic_almond_butter.jpg', title: 'Organic Almond Butter', description: 'Smooth and creamy organic almond butter.', type: 'Nuts & Seeds' });
  await db.product.create({ name: 'Organic Chia Seeds', price: 8, isSpecial: true, img: 'organic_chia_seeds.jpg', title: 'Organic Chia Seeds', description: 'Nutrient-packed organic chia seeds for your daily diet.', type: 'Nuts & Seeds' });
  await db.product.create({ name: 'Organic Bananas', price: 3, isSpecial: false, img: 'organic_bananas.jpg', title: 'Organic Bananas', description: 'Sweet and nutritious organic bananas.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Oranges', price: 4, isSpecial: false, img: 'organic_oranges.jpg', title: 'Organic Oranges', description: 'Juicy and vitamin-rich organic oranges.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Strawberries', price: 5, isSpecial: true, img: 'organic_strawberries.jpg', title: 'Organic Strawberries', description: 'Plump and sweet organic strawberries, perfect for desserts.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Peaches', price: 6, isSpecial: false, img: 'organic_peaches.jpg', title: 'Organic Peaches', description: 'Juicy and flavorful organic peaches.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Grapes', price: 7, isSpecial: false, img: 'organic_grapes.jpg', title: 'Organic Grapes', description: 'Sweet and refreshing organic grapes.', type: 'Fruits' });
  await db.product.create({ name: 'Organic Broccoli', price: 3.5, isSpecial: true, img: 'organic_broccoli.jpg', title: 'Organic Broccoli', description: 'Fresh and nutritious organic broccoli.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Corn', price: 4, isSpecial: false, img: 'organic_corn.jpg', title: 'Organic Corn', description: 'Versatile and delicious organic corn.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Cucumbers', price: 2.5, isSpecial: false, img: 'organic_cucumbers.jpg', title: 'Organic Cucumbers', description: 'Crisp and hydrating organic cucumbers.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Bell Peppers', price: 3, isSpecial: true, img: 'organic_bell_peppers.jpg', title: 'Organic Bell Peppers', description: 'Colorful and vitamin-packed organic bell peppers.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Potatoes', price: 2, isSpecial: false, img: 'organic_potatoes.jpg', title: 'Organic Potatoes', description: 'Nutritious and versatile organic potatoes.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Onions', price: 1.5, isSpecial: false, img: 'organic_onions.jpg', title: 'Organic Onions', description: 'Flavorful and aromatic organic onions.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Garlic', price: 2, isSpecial: false, img: 'organic_garlic.jpg', title: 'Organic Garlic', description: 'Aromatic and healthful organic garlic.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Lettuce', price: 3, isSpecial: false, img: 'organic_lettuce.jpg', title: 'Organic Lettuce', description: 'Crisp and refreshing organic lettuce.', type: 'Vegetables' });
  await db.product.create({ name: 'Organic Mushrooms', price: 4, isSpecial: false, img: 'organic_mushrooms.jpg', title: 'Organic Mushrooms', description: 'Nutrient-rich organic mushrooms, perfect for various dishes.', type: 'Vegetables' });
    }

module.exports = db;
