import { gql } from '@apollo/client';

export const SUBSCRIBE_TO_REVIEW_FLAGGED = gql`
subscription {
  reviewFlagged {
    reviewID
    reviewText
    status
  }
}
`;

export const SUBSCRIBE_TO_REVIEW_DELETED = gql`
subscription {
  reviewDeleted {
    reviewID
    reviewText
    status
  }
}
`;


export const MUTATION_TO_REVIEW_FLAGGED = gql`
mutation FlagReview($reviewID: ID!) {
  flagReview(reviewID: $reviewID) {
    reviewID
    status 
  }
}
`;

export const MUTATION_TO_REVIEW_DELETED = gql`
mutation DeleteReview($reviewID: ID!) {
  deleteReview(reviewID: $reviewID) {
    reviewID
    status
  }
}
`;
