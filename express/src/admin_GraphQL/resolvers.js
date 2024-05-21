const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Query: {
    users: (_, __, { db }) => db.user.findAll(),
    //Get the current reviews from the database
    reviews: async (_, __, { db }) => {
      try {
        const reviews = await db.review.findAll({
          attributes: ['reviewID', 'productID', 'userID', 'numberOfStars', 'reviewText', 'dateCreated', 'status']
        });
        return reviews;
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },
    //Get all of the flagged reviews from the database
    flaggedReviews: (_, __, { db }) => db.review.findAll({ where: { status: 'flagged' } }),
  },
  Mutation: {
    //Block/Unblock the user amd save the status to the database
    toggleUserStatus: async (_, { userID }, { db }) => {
      const user = await db.user.findByPk(userID);
      user.status = user.status === 'active' ? 'blocked' : 'active';
      await user.save();
      return user;
    },
    //Delete the user reviews and replace the review test
    deleteReview: async (_, { reviewID }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) throw new Error("Review not found.");
      await review.destroy();
      pubsub.publish('REVIEW_DELETED', { reviewDeleted: review });
      return { ...review.get(), reviewText: "[**** This review has been deleted by the admin ***]" };
    },
    //Flag the review if content is deemed inappropriate
    flagReview: async (_, { reviewID }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      review.status = 'flagged';
      await review.save();
      pubsub.publish('REVIEW_FLAGGED', { reviewFlagged: review });
      return review;
    },
  },

  //Create a subscription to indicate if review is flagged or deleted 
  Subscription: {
    reviewFlagged: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_FLAGGED'])
    },
    reviewDeleted: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_DELETED'])
    }
  }
};

module.exports = resolvers;

