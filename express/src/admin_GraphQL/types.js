const { gql } = require('apollo-server-express');

//Schema for GraphQL
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    status: String!
  }

  type Review {
    reviewID: ID!
    productID: ID!
    userID: ID!
    numberOfStars: Int!
    reviewText: String!
    dateCreated: String!
    status: String!
  }


  type ReviewDeletion {
  reviewID: ID!
  }

  type Query {
    users: [User]
    reviews: [Review]
    flaggedReviews: [Review]
  }

  type Mutation {
    toggleUserStatus(userID: ID!): User
    deleteReview(reviewID: ID!, isAdmin: Boolean!): ReviewDeletion
    flagReview(reviewID: ID!): Review
  }

  type Subscription {
    reviewUpdated: Review
    reviewFlagged: Review
    reviewDeleted: ReviewDeletion
  }
`;

module.exports = typeDefs;
