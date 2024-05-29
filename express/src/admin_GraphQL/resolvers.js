const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Query: {
    users: (_, __, { db }) => db.user.findAll(),
    //Get the current reviews from the database
    latestReviews: async (_, __, { db }) => {
      try {
        const reviews = await db.review.findAll({
          attributes: ['reviewID', 'productID', 'userID', 'numberOfStars', 'reviewText', 'dateCreated', 'status'],
          where: {
            status: ['active'],
          },
          //Order the reviews by dateCreated in descending order
          order: [['dateCreated', 'DESC']], 
          limit: 3  //Limit the number of reviews fetched to the latest three made on the SOIL website
        });
        return reviews;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw new Error("Failed to fetch reviews");
      }
    },
    //Get all active reviews for calculating average ratings
    allActiveReviews: async (_, __, { db }) => {
      try {
        const reviews = await db.review.findAll({
          attributes: ['reviewID', 'productID', 'userID', 'numberOfStars', 'reviewText', 'dateCreated', 'status'],
          where: {
            status: 'active', 
          },
          //Order the reviews by dateCreated in descending order
          order: [['dateCreated', 'DESC']], 
        });
        return reviews;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw new Error("Failed to fetch reviews");
      }
    },
    //Get all of the flagged reviews from the database
    flaggedReviews: (_, __, { db }) => db.review.findAll({ where: { status: 'flagged' } }),

    // Fetch all products from the database
    products: async (_, __, { db }) => {
      try {
        const products = await db.product.findAll();
        return products;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
      }
    },

    // Fetch a specific product by its ID
    product: async (_, { productID }, { db }) => {
      try {
        const product = await db.product.findByPk(productID);
        if (!product) {
          throw new Error("Product not found.");
        }
        return product;
      } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product");
      }
    },
  },
  Mutation: {
    //Block/Unblock the user amd save the status to the database
    toggleUserStatus: async (_, { userID }, { db }) => {
      const user = await db.user.findByPk(userID);
      //Throw an error if the user is not found
      if (!user) {
        throw new Error("User not found.");
      }
      //Set the user status to active or blocked
      user.status = user.status === 'active' ? 'blocked' : 'active';
      await user.save();
      return user;
    },
    //Delete the user reviews and replace the review test
    deleteReview: async (_, { reviewID }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) {
        console.error("Review not found for ID: ", reviewID);
        throw new Error("Review not found.");
      }
        review.status = 'deleted';
        review.reviewText = "[**** This review has been deleted by the admin ****]";
        await review.save();
        pubsub.publish('REVIEW_DELETED', { reviewDeleted: review });
        return review;
    },
    //Flag the review if content is deemed inappropriate
    flagReview: async (_, { reviewID }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) {
        console.error("Review not found for ID: ", reviewID);
        throw new Error("Review not found.");
      }
    
      //Set the status to flagged and update the review text to indicate it's flagged
      review.status = 'flagged';
      review.reviewText = "[**** This review has been flagged by the admin due to inappropriate content ****]";
      await review.save();
      pubsub.publish('REVIEW_FLAGGED', { reviewFlagged: review });
      return review;
    },

    // Create a new product
    createProduct: async (_, { name, description, type,title, price, isSpecial, img }, { db }) => {
      console.log("YAY you got this far");
      try {
        const product = await db.product.create({ name, price, isSpecial, img, title, description, type });
        return product;
      } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
      }
    },

    // Update an existing product
    updateProduct: async (_, { productID, name, description, type, price, isSpecial, img }, { db }) => {
      try {
        const product = await db.product.findByPk(productID);
        if (!product) {
          throw new Error("Product not found.");
        }
        await product.update({ name, description, type, price, isSpecial, img });
        return product;
      } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product");
      }
    },

    // Delete a product
    deleteProduct: async (_, { productID }, { db }) => {
      try {
        const product = await db.product.findByPk(productID);
        if (!product) {
          throw new Error("Product not found.");
        }
        await product.destroy();
        return product;
      } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
      }
    },
    updateReview: async (_, { reviewID, reviewText, numberOfStars }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) {
        console.error("Review not found for ID: ", reviewID);
        throw new Error("Review not found.");
      }
      review.reviewText = reviewText;
      review.numberOfStars = numberOfStars;
      await review.save();
      pubsub.publish('REVIEW_UPDATED', { reviewUpdated: review });
      return review;
    }
  },

  //Create subscriptions to indicate if review is updated, flagged or deleted 
  Subscription: {
    reviewUpdated: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_UPDATED'])
    },
    reviewFlagged: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_FLAGGED'])
    },
    reviewDeleted: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_DELETED'])
    }
  }
}

module.exports = resolvers;

