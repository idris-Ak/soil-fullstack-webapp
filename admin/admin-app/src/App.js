import { Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useSubscription, useMutation } from '@apollo/client';
import { SUBSCRIBE_TO_REVIEW_FLAGGED, SUBSCRIBE_TO_REVIEW_DELETED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED } from './apollo/queries';

function App() {
  const { data: flaggedData, loading: loadingFlagged, error: errorFlagged } = useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED);
  const { data: deletedData, loading: loadingDeleted, error: errorDeleted } = useSubscription(SUBSCRIBE_TO_REVIEW_DELETED);
  const[flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const[deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED); 
  

  const handleFlagReview = (reviewID) => {
    flagReview({ variables: { reviewID} });
  };

  const handleDeleteReview = (reviewID) => {
    deleteReview({ variables: { reviewID } });
  };

  if (loadingFlagged || loadingDeleted) return <p>Loading reviews...</p>;
  if (errorFlagged || errorDeleted) return <p>Error loading reviews! {errorFlagged?.message || errorDeleted?.message}</p>;

  return (
    <Container>
      {flaggedData?.reviewFlagged && (
        <Alert variant="warning">
          Review flagged: {flaggedData.reviewFlagged.reviewText}
        </Alert>
      )}
      {deletedData?.reviewDeleted && (
        <Alert variant="danger">
          Review deleted: {deletedData.reviewDeleted.reviewText}
        </Alert>
      )}
      <Row className="mb-3">
        {flaggedData?.reviews?.map((review) => (
          <Col key={review.reviewID} md={4}>
            <div>
              <p>{review.reviewText}</p>
              <Button onClick={() => handleFlagReview(review.reviewID)} variant="warning">Flag</Button>
              <Button onClick={() => handleDeleteReview(review.reviewID)} variant="danger">Delete</Button>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
export default App;