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
        throw new Error("Failed to fetch reviews");
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
    deleteReview: async (_, { reviewID, isAdmin }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) {
        console.error("Review not found for ID: ", reviewID);
        throw new Error("Review not found.");
      }
    
      if (isAdmin) {
        review.status = 'deleted';
        review.reviewText = "[**** This review has been deleted by the admin ***]";
        await review.save();
        pubsub.publish('REVIEW_DELETED', { reviewDeleted: review });
        return review;
      } else {
        await review.destroy();
        pubsub.publish('REVIEW_DELETED', { reviewDeleted: { reviewID } });
        return { reviewID };
      }
    },
    //Flag the review if content is deemed inappropriate
    flagReview: async (_, { reviewID }, { db }) => {
      const review = await db.review.findByPk(reviewID);
      if (!review) {
        console.error("Review not found for ID: ", reviewID);
        throw new Error("Review not found.");
      }
      review.status = 'flagged';
      await review.save();
      pubsub.publish('REVIEW_FLAGGED', { reviewFlagged: review });
      console.log("Published flagged review: ", review);
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

