import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_INITIAL_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_DELETED, SUBSCRIBE_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED, MUTATION_TO_USER_STATUS, GET_USERS} from './apollo/queries';
import { ToastContainer, toast } from 'react-toastify';
import Filter from 'bad-words';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const customFilter = new Filter();
customFilter.addWords('spam', 'hate', 'speech');  // Add more inappropriate words here

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

const App = () => {
  const { data: initialData } = useQuery(GET_INITIAL_REVIEWS);
  const { data: usersData } = useQuery(GET_USERS);
  const [toggleUserStatus] = useMutation(MUTATION_TO_USER_STATUS);
  const [flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const [deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES, {
    onData: ({ subscriptionData }) => {
      const updatedReview = subscriptionData.data.reviewUpdated;
      if (updatedReview) {
        setReviews(prevReviews => {
          const newReviews = [updatedReview, ...prevReviews.filter(review => review.reviewID !== updatedReview.reviewID)];
          return newReviews.slice(0, 3);
        });
      }
    }
  });

  useSubscription(SUBSCRIBE_TO_REVIEW_DELETED, {
    onData: ({ subscriptionData }) => {
      const deletedReviewID = subscriptionData.data.reviewDeleted.reviewID;
      if (deletedReviewID) {
        setReviews(prevReviews => prevReviews.filter(review => review.reviewID !== deletedReviewID).slice(0, 3));
      }
    }
  });

  useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED, {
    onData: ({ subscriptionData }) => {
      if (subscriptionData && subscriptionData.data && subscriptionData.data.reviewFlagged) {
        const flaggedReview = subscriptionData.data.reviewFlagged;
        setReviews(prevReviews => prevReviews.map(review =>
          review.reviewID === flaggedReview.reviewID ? { ...review, status: flaggedReview.status } : review
        ));
      } else {
        console.error('Flagged data is missing');
      }
    }
  });  

  const handleToggleUserStatus = async (userID, currentStatus) => {
    try {
      await toggleUserStatus({
        variables: { userID },
        update: (cache, { data: { toggleUserStatus } }) => {
          const existingUsers = cache.readQuery({
            query: GET_USERS
          });
  
          if (existingUsers && existingUsers.users) {
            const newUsers = existingUsers.users.map(user => {
              if (user.id === userID) {
                return { ...user, status: toggleUserStatus.status };
              } else {
                return user;
              }
            });
  
            cache.writeQuery({
              query: GET_USERS,
              data: { users: newUsers },
            });
          }
        }
      });
      toast.info(`User ${currentStatus === 'active' ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status.');
    }
  };  

  useEffect(() => {
    if (initialData && initialData.reviews) {
      setReviews(initialData.reviews.map(review => ({
        ...review,
        isFlagged: customFilter.isProfane(review.reviewText)
        })).slice(0, 3));
    }
  }, [initialData]);

  const handleConfirmedDelete = async () => {
    try {
      const response = await deleteReview({
        variables: { reviewID: selectedReview }
      });
      if (response.data.deleteReview) {
        setReviews(prev => prev.filter(r => r.reviewID !== selectedReview));
        toast.error("Review deleted!");
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.");
    }
  };

  const handleFlagReview = async (reviewID) => {
    try {
      const response = await flagReview({
        variables: { reviewID }
      });
      if (response.data && response.data.flagReview) {
        setReviews(prev => prev.map(r => {
          return r.reviewID === reviewID ? { ...r, status: response.data.flagReview.status } : r;
        }));
        toast.info(`Review ${response.data.flagReview.status === 'flagged' ? 'flagged' : 'unflagged'} successfully!`);
      } else {
        throw new Error('Flagging failed due to missing data');
      }
    } catch (error) {
      console.error("Error flagging review:", error);
      toast.error("Failed to flag review.");
    }
  };


  const groupedReviews = reviews.reduce((acc, review) => {
    const existingProduct = acc.find(r => r.productID === review.productID);
    if (existingProduct) {
      existingProduct.Reviews++;
    } else {
      acc.push({ productID: review.productID, Reviews: 1 });
    }
    return acc;
  }, []);

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
              <BarChart data={groupedReviews}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Reviews" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Users</Typography>
                {usersData && usersData.users.map(user => (
                <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                <Typography variant="body1">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                </Box>
                    <Button
                      variant="contained"
                      color={user.status === 'active' ? 'error' : 'primary'}
                      onClick={() => handleToggleUserStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? 'Block' : 'Unblock'}
                    </Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
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
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="error" onClick={() => {
                      setSelectedReview(review.reviewID);
                      setModalOpen(true);
                    }}>Delete</Button>
                    <Button variant="contained" color={review.status === 'flagged' ? 'primary' : 'warning'} onClick={() => handleFlagReview(review.reviewID)}>
                      {review.status === 'flagged' ? 'Unflag' : 'Flag as Inappropriate'}
                    </Button>
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
