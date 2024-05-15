const request = require('supertest');
const app = require('../server'); //Import the app from server.js
const db = require('../src/database');

describe('Review Controller', () => {
  let user, product;

  beforeAll(async () => {
     //Ensure the database is synchronized before tests
    await db.sequelize.sync({ alter: true });
     //Create a test user and product
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
        price: 10.00,
        isSpecial: false,
        img: 'test_product.jpg' 
      });
    });

    afterAll(async () => {
        // Clean up the test user and product
        await db.review.destroy({ where: {} });
        await db.user.destroy({ where: { id: user.id } });
        await db.product.destroy({ where: { productID: product.productID } });
        await db.sequelize.close();
      });

  /**
   * Test to ensure that a new review can be successfully created.
   * This test will:
   * 1. Send a POST request to create a review for the test product by the test user.
   * 2. Check that the response status is 200.
   * 3. Validate the response body to ensure it contains the correct review data.
   */
  it('should create a new review', async () => {
    const reviewData = {
      productID: product.productID,
      userID: user.id,
      reviewText: 'This is a test review',
      numberOfStars: 4,
      dateCreated: new Date().toISOString()
    };

    const response = await request(app)
    .post('/api/review')
    .send(reviewData);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('reviewID');
  expect(response.body).toHaveProperty('productID', reviewData.productID);
  expect(response.body).toHaveProperty('reviewText', reviewData.reviewText);
  expect(response.body).toHaveProperty('numberOfStars', reviewData.numberOfStars);
  expect(response.body).toHaveProperty('dateCreated');
  expect(response.body).toHaveProperty('user');
  expect(response.body.user).toHaveProperty('id', user.id);
  expect(response.body.user).toHaveProperty('name', user.name);
  expect(response.body).toHaveProperty('isFollowing', false);
});
});