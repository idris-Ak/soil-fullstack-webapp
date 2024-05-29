import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
//Import 'date-fns' to format the dateCreated of the review as there is no 'Date' type in GraphQL
import { format } from 'date-fns';
import { GET_LATEST_REVIEWS, GET_ALL_ACTIVE_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_DELETED, SUBSCRIBE_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED, 
MUTATION_TO_USER_STATUS, GET_USERS} from './apollo/definitions';
import { ToastContainer, toast } from 'react-toastify';
import BadWordsFilter from 'bad-words';
import profaneWords from 'profane-words';
import { Filter as ProfanityFilter } from 'profanity-check';
import Sentiment from 'sentiment';
import 'react-toastify/dist/ReactToastify.css';

const badWordsFilter = new BadWordsFilter({ emptyList: true }); //Reset the filter list
badWordsFilter.addWords(...profaneWords);

//Create functions for detecting inappropriate content
const sentiment = new Sentiment();
const profanityFilter = new ProfanityFilter();

//Create a theme for styling the admin dashboard
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#424242' }, 
    error: { main: '#d32f2f' },
    background: { default: '#f5f5f5' }, 
  },
  spacing: 4,
  typography: {
    fontFamily: 'Open-Sans, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.8rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 5px 3px rgba(100, 100, 100, .1)',
          borderRadius: '18px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
        },
      },
    },
  },
});

//Check to see if the review text is inappropriate 
const isInappropriate = (text) => {
  const isProfane = badWordsFilter.isProfane(text) || profanityFilter.isProfane(text);
  const sentimentScore = sentiment.analyze(text).score;
  return isProfane || sentimentScore < -2;
};

function AdminDashboard() {
  //Queries and Subscriptions
  const { data, loading, refetch: refetchLatestReviews } = useQuery(GET_LATEST_REVIEWS, {
    pollInterval: 3000, //Poll every 3 seconds
  });
  const { data: activeReviewsData, loading: activeReviewsLoading, refetch: refetchActiveReviews } = useQuery(GET_ALL_ACTIVE_REVIEWS, {
    pollInterval: 3000, //Poll every 3 seconds
  });
  const { data: usersData } = useQuery(GET_USERS);

  //Mutations
  const [toggleUserStatus] = useMutation(MUTATION_TO_USER_STATUS);
  const [flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const [deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED);

  //States
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false); //State for flag confirmation modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [averageRatings, setAverageRatings] = useState([]);

  //Subscriptions 
  const { data: reviewUpdatedData } = useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES);
  const { data: reviewDeletedData } = useSubscription(SUBSCRIBE_TO_REVIEW_DELETED);
  const { data: reviewFlaggedData } = useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED);

  const updateAverageRatings = (reviews) => {
    //Calculate the average rating of all the active reviews for each product
    const averageRatingsByProduct = reviews.reduce((acc, review) => {
      //Set all the attributes to 0 if there are no reviews for a product
      if (!acc[review.productID]) {
        acc[review.productID] = { productID: review.productID, totalStars: 0, count: 0, averageRating: 0 };
      }
      //Calculate the average rating
      acc[review.productID].totalStars += review.numberOfStars;
      acc[review.productID].count++;
      acc[review.productID].averageRating = (acc[review.productID].totalStars / acc[review.productID].count).toFixed(1);
      return acc;
    }, {});
    return Object.values(averageRatingsByProduct);
  };

  useEffect(() => {
    //Filter only the active reviews to be displayed on the admin dashboard
    if (!loading && data) {
      const filteredReviews = data.latestReviews.filter((review) => review.status === 'active').map((review) => ({
        ...review,
        //If the review text is detected to be inappropriate, automatically flag it and display the corresponding text and change the status 
        reviewText: isInappropriate(review.reviewText) ? "[**** This review has been flagged due to inappropriate content ****]" : review.reviewText,
        status: isInappropriate(review.reviewText) ? "flagged" : review.status
      }));
      setReviews(filteredReviews);
    }
  }, [data, loading]);

  useEffect(() => {
    //If the reviews are updated, then do the same thing as above to display the latest three active reviews 
    if (reviewUpdatedData || reviewDeletedData || reviewFlaggedData) {
      refetchActiveReviews();
    }
  }, [reviewUpdatedData, reviewDeletedData, reviewFlaggedData, refetchActiveReviews]);

  useEffect(() => {
    //If there are new reviews added, update the average ratings in real time to update the graph
    if (!activeReviewsLoading && activeReviewsData) {
      const updatedAverageRatings = updateAverageRatings(activeReviewsData.allActiveReviews);
      setAverageRatings(updatedAverageRatings);
    }
  }, [activeReviewsData, activeReviewsLoading]);

  //Call refetchActiveReviews to load the initial data
  useEffect(() => {
  refetchActiveReviews();
  }, [refetchActiveReviews]);
//   useEffect(() => {
//     //If the review is deleted then filter it out and remove it from the admin dashboard in real time
//     if (reviewDeletedData) {
//       setReviews(prev => prev.filter(review => review.reviewID !== reviewDeletedData.reviewDeleted.reviewID));
//       refetchActiveReviews(); //Refetch the active reviews for to update the graph in real time
//     }
//   }, [reviewDeletedData, refetchActiveReviews]);

//   useEffect(() => {
//     //If the review is flagged then filter it out and remove it from the admin dashboard in real time
//     if (reviewFlaggedData) {
//       setReviews(prev => prev.filter(review => review.reviewID !== reviewFlaggedData.reviewFlagged.reviewID));
//       refetchActiveReviews(); //Refetch the active reviews for to update the graph in real time
//     }
//   }, [reviewFlaggedData, refetchActiveReviews]);

  const handleToggleUserStatus = async (userID, currentStatus) => {
    try {
      //Get all the users
      await toggleUserStatus({variables: { userID }, update: (cache, { data: { toggleUserStatus } }) => {
          const existingUsers = cache.readQuery({query: GET_USERS});
          if (existingUsers && existingUsers.users) {
            const newUsers = existingUsers.users.map(user => {
              //Update the user status if changed in the admin dashboard
              if (user.id === userID) {
                return { ...user, status: toggleUserStatus.status };
              } 
              else {
                return user;
              }
            });
            cache.writeQuery({query: GET_USERS,data: { users: newUsers },
            });
          }
        }
      });
      //Display a message to indicate successful action
      toast.info(`User ${currentStatus === 'active' ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      //Display an error message to indicate unsuccessful action
      console.error('Error toggling user status:', error);
      toast.error('Failed to toggle user status.');
    }
  };   

  const handleDeleteReview = async () => {
    try {
      //Handle deleting reviews from the admin dashboard
      const response = await deleteReview({ variables: { reviewID: selectedReview } });
      if (response.data.deleteReview) {
        const remainingReviews = reviews.filter((r) => r.reviewID !== selectedReview);
        setReviews(remainingReviews);
        toast.error("Review Deleted Successfully!");
        setModalOpen(false);
        refetchActiveReviews(); //Refetch the active reviews for to update the graph in real time
        refetchLatestReviews(); //Refetch the latest reviews
      }
    } catch (error) {
      //Display an error message to indicate unsuccessful action
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.");
    }
  };

  const handleFlagReview = async (reviewID) => {
    try {
      const response = await flagReview({ variables: { reviewID } });
      if (response.data && response.data.flagReview) {
        setReviews(reviews.map(r => r.reviewID === reviewID ? { ...r, status: response.data.flagReview.status } : r));
        toast.success("Review Flagged Successfully!");
        refetchActiveReviews(); //Refetch the active reviews for to update the graph in real time
        refetchLatestReviews(); //Refetch the latest reviews
        setFlagModalOpen(false); // Close the flag confirmation modal
      }
    } catch (error) {
      //Display an error message to indicate unsuccessful action
      console.error("Error flagging review:", error);
      toast.error("Failed to flag review.");
    }
  };

return (
  <ThemeProvider theme={theme}>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ mb: 4 }}>Admin Dashboard</Typography>
      
      <Grid container spacing={6} sx={{ justifyContent: 'center' }}>
        {/* Average Ratings By Product Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Average Ratings By Product</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={averageRatings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="productID" label={{ value: "Product ID", position: 'insideBottom', offset: -5 }} />
                  <YAxis allowDecimals={false} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '30px' }} />
                  <Bar dataKey="averageRating" fill="#1976d2" barSize={40} name="Average Rating" />
                </BarChart> 
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Users Card */}
        {usersData && usersData.users.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 5, color: theme.palette.secondary.main }}>
            No users to display
            </Typography>
        </Grid>
        ) : (
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
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
        )}

        {/* Reviews */}
        {reviews.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 5, color: theme.palette.secondary.main }}>
              No reviews to display
            </Typography>
          </Grid>
        ) : (
          reviews.map(review => (
            <Grid item key={review.reviewID} xs={12} sm={6} md={4}>
              <Card sx={{ mb: 4, p: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Product {review.productID}
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
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
                    <Button variant="contained" color="primary" onClick={() => {
                    setSelectedReview(review.reviewID);
                    setFlagModalOpen(true); 
                    }}>
                    Flag as Inappropriate
                    </Button>
                )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteReview} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Flag Confirmation Dialog */}
    <Dialog open={flagModalOpen} onClose={() => setFlagModalOpen(false)}>
    <DialogTitle>Confirm Flagging</DialogTitle>
    <DialogContent>
    <DialogContentText>
      Are you sure you want to flag this review as inappropriate? This action cannot be undone.
    </DialogContentText>
    </DialogContent>
    <DialogActions>
    <Button onClick={() => setFlagModalOpen(false)}>Cancel</Button>
    <Button onClick={handleFlagReview} color="primary">Flag</Button>
    </DialogActions>
    </Dialog>
    </Container>
    </ThemeProvider>
);
};

export default AdminDashboard;
