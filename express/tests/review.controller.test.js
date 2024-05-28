const request = require('supertest');
const { app, ApolloServer } = require('../server'); //Import the app and ApolloServer from server.js
const db = require('../src/database');

describe('Review Controller', () => {
  let user, product, reviewID;

  beforeAll(async () => {
     //Ensure the database is synchronized before tests
    await db.sequelize.sync();
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
        price: 5.00,
        isSpecial: false,
        img: 'test_product.jpg' 
      });
    });

    afterAll(async () => {
      // Clean up the test user and product
      await db.review.destroy({ where: { reviewID } });
      await db.user.destroy({ where: { id: user.id } });
      await db.product.destroy({ where: { productID: product.productID } });
      await db.sequelize.close();
      //Close the ApolloServer
      if (ApolloServer) {
        await ApolloServer.stop();
      }
    });
    
  /**
   * Test to ensure that a new review can be successfully created
   * This test will:
   * 1. Send a 'post' request to create a review for the test product by the test user
   * 2. Check that the response status is 200
   * 3. Validate the response body to ensure it contains the correct review data
   */
   it('should create a new review', async () => {
    const reviewData = {
      productID: product.productID,
      userID: user.id,
      reviewText: 'This is a test review',
      numberOfStars: 4,
      dateCreated: new Date().toISOString(),
    };

    const response = await request(app).post('/api/review').send(reviewData);

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

    //Store the reviewID for cleanup
    reviewID = response.body.reviewID;
  });

  /**
   * Test to ensure that a review can be deleted successfully
   * This test will:
   * 1. Send a DELETE request to delete the review created in the previous test
   * 2. Check that the response status is 200
   * 3. Validate the response body to ensure it contains the correct deletion confirmation message
   */
  it('should delete a review successfully', async () => {
    const response = await request(app).delete(`/api/review/${reviewID}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Review Successfully Deleted!');

    //Verify that the review has been deleted
    const fetchResponse = await request(app).get(`/api/review/${product.productID}`);
    expect(fetchResponse.body.reviews).not.toContainEqual(expect.objectContaining({ reviewID }));
  });

  /**
   * Test to ensure that a review can be updated successfully
   * This test will:
   * 1. Create a new review
   * 2. Send a 'put' request to update the review text and number of stars
   * 3. Check that the response status is 200
   * 4. Validate the response body to ensure it contains the updated review data
   */
  it('should update a review successfully', async () => {
    // Create a new review to update
    const reviewData = {
      productID: product.productID,
      userID: user.id,
      reviewText: 'This is a test review that is going to be updated',
      numberOfStars: 5,
      dateCreated: new Date().toISOString(),
    };

    const createResponse = await request(app).post('/api/review').send(reviewData);
    const updateReviewID = createResponse.body.reviewID;

    const updatedReviewData = {
      reviewText: 'This is an updated test review',
      numberOfStars: 4,
    };

    const response = await request(app).put(`/api/review/${updateReviewID}`).send(updatedReviewData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reviewID', updateReviewID);
    expect(response.body).toHaveProperty('reviewText', updatedReviewData.reviewText);
    expect(response.body).toHaveProperty('numberOfStars', updatedReviewData.numberOfStars);
  });

  /**
   * Test to ensure that review text adheres to the 100-character limit
   * This test will:
   * 1. Send a 'post' request with a review text exceeding 100 characters
   * 2. Check that the response status is 400 (Bad Request)
   * 3. Validate the response body to ensure it contains an appropriate error message
   */
  it('should not allow review text to exceed 100 characters', async () => {
    const invalidReviewText = 'A'.repeat(101); //Create a string with 101 characters
    const reviewData = {
      productID: product.productID,
      userID: user.id,
      reviewText: invalidReviewText,
      numberOfStars: 2,
      dateCreated: new Date().toISOString(),
    };

    const response = await request(app).post('/api/review').send(reviewData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Review text cannot exceed 100 characters');
  });

    /**
   * Test to ensure that the review is not created with missing required fields
   * This test will:
   * 1. Send a 'post' request with empty review text and number of stars
   * 2. Check that the response status is 400 (Bad Request)
   * 3. Validate the response body to ensure it contains the appropriate error message
   */
  it('should not allow the review text or the number of stars to be empty', async () => {
    const reviewDataWithEmptyText = {
      productID: product.productID,
      userID: user.id,
      reviewText: '',
      numberOfStars: 1,
      dateCreated: new Date().toISOString(),
    };

    const reviewDataWithEmptyStars = {
      productID: product.productID,
      userID: user.id,
      reviewText: 'This is a test review',
      numberOfStars: '',
      dateCreated: new Date().toISOString(),
    };

    const responseEmptyText = await request(app).post('/api/review').send(reviewDataWithEmptyText);
    const responseEmptyStars = await request(app).post('/api/review').send(reviewDataWithEmptyStars);

    expect(responseEmptyText.status).toBe(400);
    expect(responseEmptyText.body).toHaveProperty('message');
    expect(responseEmptyText.body.message).toContain('Missing required fields');

    expect(responseEmptyStars.status).toBe(400);
    expect(responseEmptyStars.body).toHaveProperty('message');
    expect(responseEmptyStars.body.message).toContain('Missing required fields');
  });
});