import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_INITIAL_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED, MUTATION_TO_USER_STATUS, GET_USERS} from './apollo/queries';
import { ToastContainer, toast } from 'react-toastify';
import Filter from 'bad-words';
import profaneWords from 'profane-words';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
// import client from './apollo/client';

const customFilter = new Filter({ emptyList: true });  //Reset the filter list
customFilter.addWords('spam', 'hate', 'speech', ...profaneWords);  // Add more inappropriate words here

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
  const [originalTexts, setOriginalTexts] = useState({});

  //Handle real-time updates for new and updated reviews
  useSubscription(SUBSCRIBE_TO_REVIEW_UPDATES, {
    onSubscriptionData: ({ subscriptionData }) => {
      const { reviewUpdated, reviewDeleted, reviewFlagged } = subscriptionData.data;
      let updatedReviews = [...reviews];
      if (reviewUpdated) {
        updatedReviews = updatedReviews.map(r => r.reviewID === reviewUpdated.reviewID ? { ...r, ...reviewUpdated } : r);
      }
      if (reviewDeleted) {
        updatedReviews = updatedReviews.filter(r => r.reviewID !== reviewDeleted.reviewID);
      }
      if (reviewFlagged) {
        updatedReviews = updatedReviews.map(r => {
          if (r.reviewID === reviewFlagged.reviewID) {
            const originalText = reviewFlagged.status === 'flagged' ? r.reviewText : originalTexts[reviewFlagged.reviewID];
            setOriginalTexts(prev => ({ ...prev, [reviewFlagged.reviewID]: r.reviewText }));
            return { ...r, reviewText: originalText, status: reviewFlagged.status };
          }
          return r;
        });
      }
      setReviews(updatedReviews.filter(r => r.status !== 'deleted').slice(0, 3));
    }
  });

 //Handle real-time updates for deleted reviews
//  useSubscription(SUBSCRIBE_TO_REVIEW_DELETED, {
//   onData: ({ subscriptionData }) => {
//     if (subscriptionData?.data?.reviewDeleted) { 
//       const deletedReviewID = subscriptionData.data.reviewDeleted.reviewID;
//     setReviews(prevReviews => prevReviews.filter(review => review.reviewID !== deletedReviewID));
//     fetchLatestReviews();
//   }
//   }
// }); 

// //Function to fetch the latest reviews
// const fetchLatestReviews = async () => {
//   const { data } = await client.query({
//     query: GET_INITIAL_REVIEWS,
//     fetchPolicy: 'network-only'  //Ensures the query always fetches fresh data
//   });
//   if (data && data.reviews) {
//     setReviews(data.reviews.slice(0, 3));
//   }
// };

//   //Handle real-time updates for flagged reviews
//   useSubscription(SUBSCRIBE_TO_REVIEW_FLAGGED, {
//     onData: ({ subscriptionData }) => {
//       if (subscriptionData?.data?.reviewFlagged) {
//         const { reviewFlagged } = subscriptionData.data;
//         setReviews(prevReviews => prevReviews.map(review => {
//           if (review.reviewID === reviewFlagged.reviewID) {
//             if (reviewFlagged.status === 'flagged') {
//               // Save the original text when flagging
//               setOriginalTexts(prev => ({ ...prev, [reviewFlagged.reviewID]: review.reviewText }));
//               return { ...review, reviewText: reviewFlagged.reviewText, status: 'flagged' };
//             } else {
//               // Restore the original text when unflagging
//               return { ...review, reviewText: originalTexts[reviewFlagged.reviewID], status: 'active' };
//             }
//           }
//           return review;
//         }));
//       }
//     }
//   });
  
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

  useEffect(() => {
    if (initialData && initialData.reviews) {
      const filteredReviews = initialData.reviews.map(review => ({
        ...review,
        reviewText: customFilter.isProfane(review.reviewText) ? "[**** This review has been flagged due to inappropriate content ****]" : review.reviewText
      })).filter(review => review.status !== 'deleted').slice(0, 3);
      setReviews(filteredReviews);
    }
  }, [initialData]);

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
        toast.success(`Review ${response.data.flagReview.status === 'flagged' ? 'flagged' : 'unflagged'} successfully!`);
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
          <BarChart data={groupedReviews} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="productID" label={{ value: "Product ID", position: 'insideBottom', offset: -5 }} />
          <YAxis allowDecimals={false} label={{ value: 'Reviews Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
         <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Bar dataKey="Reviews" fill="#8884d8" barSize={20} />
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
