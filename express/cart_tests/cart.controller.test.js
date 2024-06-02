const request = require('supertest');
const { app } = require('../server');
const db = require('../src/database');

describe('Shopping Cart Controller', () => {
  let user, product, cart; // Declare cart outside of the hooks

  beforeAll(async () => {
    await db.sequelize.sync();
    user = await db.user.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpassword',
      dateJoined: new Date()
    });

    product = await db.product.create({
      name: 'Test Product',
      description: 'This is a test product',
      type: 'Fruits',
      price: 5.00,
      isSpecial: false,
      img: 'test_product.jpg'
    });

    cart = await db.shoppingCart.create({
      userID: user.id
    });
  });

  afterAll(async () => {
    // Check if cart is defined before attempting to destroy it
    if (cart) {
      await db.cartItem.destroy({ where: { cartID: cart.cartID } });
      await db.shoppingCart.destroy({ where: { cartID: cart.cartID } });
    }
    await db.user.destroy({ where: { id: user.id } });
    await db.product.destroy({ where: { productID: product.productID } });
    await db.sequelize.close();
  });

  /**
   * Test to ensure that an item can be added to the shopping cart successfully
   * This test will:
   * 1. Send a 'post' request to add an item to the cart
   * 2. Check that the response status is 200
   * 3. Validate the response body to ensure it contains the correct cart item data
   */
  it('should add an item to the cart successfully', async () => {
    const itemData = {
      cartID: cart.cartID,
      productID: product.productID,
      quantity: 2,
      price: product.price
    };
    console.log("itemData:", itemData );

    const response = await request(app).post('/api/cartItem').send(itemData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Item added to cart successfully');
    expect(response.body).toHaveProperty('cartItemID');
  });
});
