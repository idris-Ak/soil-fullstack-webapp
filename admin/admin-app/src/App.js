import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
//Import 'date-fns' to format the date as the date type in GraphQL is defined as a 'String'
import { format } from 'date-fns';
import { GET_LATEST_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_DELETED, SUBSCRIBE_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED, MUTATION_TO_USER_STATUS, GET_USERS} from './apollo/queries';
import { ToastContainer, toast } from 'react-toastify';
import Filter from 'bad-words';
import profaneWords from 'profane-words';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const filter = new Filter({ emptyList: true });  //Reset the filter list
filter.addWords(...profaneWords, 'spam', 'hate', 'speech');

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
  const { data, loading } = useQuery(GET_LATEST_REVIEWS, {
    pollInterval: 5000, // Poll every 5 seconds
  });
  const { data: usersData } = useQuery(GET_USERS);
  const [toggleUserStatus] = useMutation(MUTATION_TO_USER_STATUS);
  const [flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const [deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const { data: reviewUpdatedData } = useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES);
  const { data: reviewDeletedData } = useSubscription(SUBSCRIBE_TO_REVIEW_DELETED);
  const { data: reviewFlaggedData } = useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED);

  useEffect(() => {
    if (!loading && data) {
      const filteredReviews = data.latestReviews.filter(review => review.status !== 'deleted' && review.status !== 'flagged').map(review => ({
        ...review,
        reviewText: filter.isProfane(review.reviewText) ? "[**** This review has been flagged due to inappropriate content ****]" : review.reviewText,
        status: filter.isProfane(review.reviewText) ? "flagged" : review.status
      }));
      setReviews(filteredReviews);
    }
  }, [data, loading]);
  
  useEffect(() => {
    if (reviewUpdatedData) {
      const newReview = reviewUpdatedData.reviewUpdated;
      if (newReview.status !== 'deleted' && newReview.status !== 'flagged') {
        const updatedReview = {
          ...newReview,
          reviewText: filter.isProfane(newReview.reviewText) ? "[**** This review has been flagged due to inappropriate content ****]" : newReview.reviewText,
          status: filter.isProfane(newReview.reviewText) ? "flagged" : newReview.status
        };
        setReviews(prev => [updatedReview, ...prev.filter(r => r.reviewID !== newReview.reviewID)].slice(0, 3));
      } else {
        setReviews(prev => prev.filter(review => review.reviewID !== newReview.reviewID));
      }
    }
  }, [reviewUpdatedData]);

  useEffect(() => {
    if (reviewDeletedData) {
      setReviews(prev => prev.filter(review => review.reviewID !== reviewDeletedData.reviewDeleted.reviewID));
    }
  }, [reviewDeletedData]);
  
  useEffect(() => {
    if (reviewFlaggedData) {
      setReviews(prev => prev.filter(review => review.reviewID !== reviewFlaggedData.reviewFlagged.reviewID));
    }
  }, [reviewFlaggedData]);


  const handleToggleUserStatus = async (userID, currentStatus) => {
    try {
      await toggleUserStatus({variables: { userID }, update: (cache, { data: { toggleUserStatus } }) => {
          const existingUsers = cache.readQuery({query: GET_USERS});
          if (existingUsers && existingUsers.users) {
            const newUsers = existingUsers.users.map(user => {
              if (user.id === userID) {
                return { ...user, status: toggleUserStatus.status };
              } else {
                return user;
              }
            });
            cache.writeQuery({query: GET_USERS,data: { users: newUsers },
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


  const handleConfirmedDelete = async () => {
    try {
      const response = await deleteReview({ variables: { reviewID: selectedReview } });
      if (response.data.deleteReview) {
        const remainingReviews = reviews.filter(r => r.reviewID !== selectedReview);
        setReviews(remainingReviews);
        toast.error("Review deleted successfully!");
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.");
    }
  };

  const handleFlagReview = async (reviewID) => {
    try {
      const response = await flagReview({ variables: { reviewID } });
      if (response.data && response.data.flagReview) {
        setReviews(reviews.map(r => r.reviewID === reviewID ? { ...r, status: response.data.flagReview.status } : r));
        toast.success("Review flagged successfully!");
      } else {
        throw new Error('Flagging failed due to missing data');
      }
    } catch (error) {
      console.error("Error flagging review:", error);
      toast.error("Failed to flag review.");
    }
  };

  const averageRatingsByProduct = reviews.reduce((acc, review) => {
    if (!acc[review.productID]) {
      acc[review.productID] = { productID: review.productID, totalStars: 0, count: 0, averageRating: 0 };
    }
    acc[review.productID].totalStars += review.numberOfStars;
    acc[review.productID].count++;
    acc[review.productID].averageRating = acc[review.productID].totalStars / acc[review.productID].count;
    return acc;
  }, {});

  const averageRatingsArray = Object.values(averageRatingsByProduct);

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
              <BarChart data={averageRatingsArray} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productID" label={{ value: "Product ID", position: 'insideBottom', offset: -5 }} />
                <YAxis allowDecimals={false} label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '30px' }} />
                <Bar dataKey="averageRating" fill="#8884d8" barSize={20} name="Average Rating" />
              </BarChart>
            </ResponsiveContainer> 
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Users</Typography>
                {usersData && usersData.users.map((user, index, array) => (
                <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: index !== array.length - 1 ? '1px solid #e0e0e0' : '' }}>
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
                  {review.reviewText}
                  </Typography>
                  <Typography color="textSecondary">
                    Stars: {review.numberOfStars}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Date: {format(new Date(Number(review.dateCreated)), 'PPP')}
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="error" onClick={() => {
                      setSelectedReview(review.reviewID);
                      setModalOpen(true);
                    }}>Delete</Button>
                     {review.reviewText !== "[**** This review has been flagged due to inappropriate content ****]" && (
                      <Button variant="contained" color="primary" onClick={() => handleFlagReview(review.reviewID)}>
                        Flag as Inappropriate
                      </Button>
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
