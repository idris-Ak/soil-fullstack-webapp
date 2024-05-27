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
