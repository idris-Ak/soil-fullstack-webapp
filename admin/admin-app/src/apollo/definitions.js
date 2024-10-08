import { gql } from '@apollo/client';

//Query to get the latest reviews
export const GET_LATEST_REVIEWS = gql`
query {
  latestReviews {
    reviewID
    productID
    userID
    reviewText
    numberOfStars
    dateCreated
    status
    }
  }
`;

export const GET_REVIEW_METRICS = gql`
  query {
    reviewMetrics {
      productID
      name
      totalReviews
      flaggedReviews
      deletedReviews
    }
  }
`;

//Query to get all of the active reviews
export const GET_ALL_ACTIVE_REVIEWS = gql`
  query {
    allActiveReviews {
      reviewID
      productID
      userID
      reviewText
      numberOfStars
      dateCreated
      status
    }
  }
`;

//Query to get the users
export const GET_USERS = gql `
query {
  users {
    id
    name
    email
    status
  }
}
`;

export const GET_MOST_POPULAR_PRODUCTS = gql`
  query {
    mostPopularProducts {
      productID
      name
      count
    }
  }
`;

//Subscription to listen for updates on reviews
export const SUBSCRIBE_TO_REVIEW_UPDATES = gql`
subscription {
  reviewUpdated {
    reviewID
    productID
    userID
    reviewText
    numberOfStars
    dateCreated
    status
  }
}
`;

//Subscription to listen for deleted reviews
export const SUBSCRIBE_TO_REVIEW_DELETED = gql`
subscription {
  reviewDeleted {
    reviewID
  }
}
`;

//Subscription to listen for flagged reviews
export const SUBSCRIBE_TO_REVIEW_FLAGGED = gql`
subscription {
  reviewFlagged {
    reviewID
    productID
    userID
    reviewText
    numberOfStars
    dateCreated
    status
  }
}
`;


//Mutation to toggle the user status
export const MUTATION_TO_USER_STATUS = gql `
mutation ToggleUserStatus($userID: ID!) {
  toggleUserStatus(userID: $userID) {
    id
    status
  }
}
`;

//Mutation to flag a review as inappropriate
export const MUTATION_TO_REVIEW_FLAGGED = gql`
mutation FlagReview($reviewID: ID!) {
  flagReview(reviewID: $reviewID) {
    reviewID
    status 
  }
}
`;

//Mutation to delete a review
export const MUTATION_TO_REVIEW_DELETED = gql`
mutation DeleteReview($reviewID: ID!) {
  deleteReview(reviewID: $reviewID) {
    reviewID
    status
    reviewText
  }
}
`;


// Query to get all products
export const GET_PRODUCTS = gql`
  query {
    products {
      productID
      name
      description
      type
      price
      isSpecial
      img
    }
  }
`;

// Query to get a specific product by ID
export const GET_PRODUCT = gql`
  query GetProduct($productID: ID!) {
    product(productID: $productID) {
      productID
      name
      description
      type
      price
      isSpecial
      img
    }
  }
`;

// Mutation to create a new product
export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String
    $title: String
    $type: String!
    $price: Float!
    $isSpecial: Boolean
    $img: String
  ) {
    createProduct(
      name: $name
      description: $description
      title: $title
      type: $type
      price: $price
      isSpecial: $isSpecial
      img: $img
    ) {
      productID
      name
      description
      title
      type
      price
      isSpecial
      img
    }
  }
`;

// Mutation to update an existing product
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $productID: ID!
    $name: String!
    $description: String
    $type: String!
    $price: Float!
    $isSpecial: Boolean
    $img: String
  ) {
    updateProduct(
      productID: $productID
      name: $name
      description: $description
      type: $type
      price: $price
      isSpecial: $isSpecial
      img: $img
    ) {
      productID
      name
      description
      type
      price
      isSpecial
      img
    }
  }
`;

// Mutation to delete a product
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productID: ID!) {
    deleteProduct(productID: $productID) {
      productID
    }
  }
`;

