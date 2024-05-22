import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_INITIAL_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_DELETED, SUBSCRIBE_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED } from './apollo/queries';
import { ToastContainer, toast } from 'react-toastify';
import Filter from 'bad-words';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const filter = new Filter();

const theme = createTheme({
  palette: {
    primary: { main: '#556cd6' },
    secondary: { main: '#19857b' },
    error: { main: '#ff1744' },
    background: { default: '#fff' },
  },
  spacing: 4,
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
});

function App() {
  const { data: initialData } = useQuery(GET_INITIAL_REVIEWS);
  const [flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const [deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES, {
    onSubscriptionData: ({ subscriptionData }) => {
      const updatedReview = subscriptionData.data.reviewUpdated;
      if (updatedReview) {
        setReviews(prevReviews => [updatedReview, ...prevReviews.filter(review => review.reviewID !== updatedReview.reviewID)].slice(0, 3));
      }
    }
  });
  
  useSubscription(SUBSCRIBE_TO_REVIEW_DELETED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const deletedReviewID = subscriptionData.data.reviewDeleted.reviewID;
      if (deletedReviewID) {
        setReviews(prevReviews => prevReviews.filter(review => review.reviewID !== deletedReviewID).slice(0, 3));
      }
    }
  });
  
  useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const flaggedReview = subscriptionData.data.reviewFlagged;
      if (flaggedReview) {
        setReviews(prevReviews => prevReviews.map(review => review.reviewID === flaggedReview.reviewID ? flaggedReview : review));
      }
    }
  });
  
  useEffect(() => {
    if (initialData && initialData.reviews) {
      setReviews(initialData.reviews.map(review => ({
        ...review,
        isFlagged: filter.isProfane(review.reviewText),
        dateCreated: new Date(review.dateCreated).toLocaleDateString()
      })).slice(0, 3));
    }
  }, [initialData]);

  const handleConfirmedDelete = async () => {
    await deleteReview({ variables: { reviewID: selectedReview, isAdmin: true } });
    setReviews(prev => prev.filter(r => r.reviewID !== selectedReview));
    toast.error("Review deleted!");
    setModalOpen(false);
  };

  const handleFlagReview = async (reviewID) => {
    const response = await flagReview({ variables: { reviewID } });
    if (response.data.flagReview) {
      setReviews(prev => prev.map(r => r.reviewID === reviewID ? { ...r, status: 'flagged' } : r));
      toast.info("Review flagged as inappropriate!");
    }
  };

  if (reviews.length === 0) {
    return <Typography>No reviews to display</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <ToastContainer />
        <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviews.map(review => ({ name: `Product ${review.productID}`, Reviews: 1 }))}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Reviews" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          {reviews.map(review => (
            <Grid item key={review.reviewID} xs={12} sm={6} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Product {review.productID}
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {review.isFlagged ? '🚩 ' : ''}{review.reviewText}
                  </Typography>
                  <Typography color="textSecondary">
                    Stars: {review.numberOfStars}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Date: {review.dateCreated}
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="error" onClick={() => {
                      setSelectedReview(review.reviewID);
                      setModalOpen(true);
                    }}>Delete</Button>
                    {!review.isFlagged && (
                      <Button variant="contained" color="warning" onClick={() => handleFlagReview(review.reviewID)}>Flag as Inappropriate</Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this review?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmedDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
