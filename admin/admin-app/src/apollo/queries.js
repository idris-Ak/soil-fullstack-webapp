import { gql } from '@apollo/client';

//Query to get the initial reviews from the server
export const GET_INITIAL_REVIEWS = gql`
query{
  reviews {
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
  reviewDeleted {
    reviewID
  }
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
mutation DeleteReview($reviewID: ID!, $isAdmin: Boolean!) {
  deleteReview(reviewID: $reviewID, isAdmin: $isAdmin) {
    reviewID
    status
    reviewText
  }
}
`;
