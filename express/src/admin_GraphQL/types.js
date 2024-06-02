const { gql } = require('apollo-server-express');

// Schema for GraphQL
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

  type Product {
    productID: ID!
    name: String!
    title: String
    description: String
    type: String!
    price: Float!
    isSpecial: Boolean!
    img: String
  }

  type PopularProduct {
    productID: ID!
    name: String!
    count: Int!
  }

  type ReviewMetric {
    productID: ID!
    name: String
    totalReviews: Int!
    flaggedReviews: Int!
    deletedReviews: Int!
  }
  
  type Query {
    reviewMetrics: [ReviewMetric]
    users: [User]
    latestReviews: [Review]
    allActiveReviews: [Review]
    flaggedReviews: [Review]
    products: [Product]
    product(productID: ID!): Product
    mostPopularProducts: [PopularProduct]
    }


  type Mutation {
    toggleUserStatus(userID: ID!): User
    deleteReview(reviewID: ID!): Review
    flagReview(reviewID: ID!): Review
    createProduct(name: String!, description: String, title:String, type: String!, price: Float!, isSpecial: Boolean, img: String): Product
    updateProduct(productID: ID!, name: String, description: String, type: String, price: Float, isSpecial: Boolean, img: String): Product
    deleteProduct(productID: ID!): Product
    updateReview(reviewID: ID!, reviewText: String!, numberOfStars: Int!): Review
  }

  type Subscription {
    reviewUpdated: Review
    reviewFlagged: Review
    reviewDeleted: Review
  }
`;

module.exports = typeDefs;
