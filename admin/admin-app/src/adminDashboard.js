import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, ThemeProvider, createTheme, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
//Import 'date-fns' to format the dateCreated of the review as there is no 'Date' type in GraphQL
import { format } from 'date-fns';
import { GET_LATEST_REVIEWS, GET_ALL_ACTIVE_REVIEWS, SUBSCRIBE_TO_REVIEW_UPDATES, SUBSCRIBE_TO_REVIEW_DELETED, SUBSCRIBE_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_FLAGGED, MUTATION_TO_REVIEW_DELETED, 
MUTATION_TO_USER_STATUS, GET_USERS,  GET_PRODUCTS, CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT,} from './apollo/definitions';
import { ToastContainer, toast } from 'react-toastify';
import BadWordsFilter from 'bad-words';
import profaneWords from 'profane-words';
import { Filter as ProfanityFilter } from 'profanity-check';
import Sentiment from 'sentiment';
import PopularProductsChart from "./itemPopGraph";
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
  return isProfane || sentimentScore < -1;
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
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_PRODUCTS);

  //Mutations
  const [toggleUserStatus] = useMutation(MUTATION_TO_USER_STATUS);
  const [flagReview] = useMutation(MUTATION_TO_REVIEW_FLAGGED);
  const [deleteReview] = useMutation(MUTATION_TO_REVIEW_DELETED);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  
  //States
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false); //State for flag confirmation modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [averageRatings, setAverageRatings] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    title: '',
    type: '',
    price: 0,
    isSpecial: false, // Add isSpecial attribute with default value
    img: ''
  });
  const [editedProduct, setEditedProduct] = useState(null); // State for edited product
  
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
  if (!loading && data) {
    const handleFlagging = async (review) => {
      //Flag the review automatically if any inappropriate content is detected
      if (isInappropriate(review.reviewText)) {
        await flagReview({ variables: { reviewID: review.reviewID } });
        return false;
      }
      return true;
    };

    //Filter the reviews to only display active reviews on the admin dashboard
    const filterReviews = async () => {
      const filteredReviews = [];
      for (const review of data.latestReviews) {
        if (review.status === 'active') {
          const shouldDisplay = await handleFlagging(review);
          if (shouldDisplay) {
            filteredReviews.push(review);
          }
        }
      }
      setReviews(filteredReviews);
    };
    filterReviews();
  }
  }, [data, loading, flagReview]);

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

  const handleFlagReview = async () => {
    try {
      const response = await flagReview({ variables: { reviewID: selectedReview } });
      if (response.data && response.data.flagReview) {
      setReviews(reviews.map(r => r.reviewID === selectedReview ? { ...r, status: response.data.flagReview.status } : r));
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

  //Handle the flag confirmation modal
  const handleOpenFlagModal = (reviewID) => {
  setSelectedReview(reviewID);
  setFlagModalOpen(true);
};
  
  // Effect for fetching products
  useEffect(() => {
    // console.log("the useEffect for getting products is called",productsData.products)
    if (!productsLoading && productsData) {
      setProducts(productsData.products);
    }
  }, [productsData, productsLoading]);

  // Function to handle input change for new product form
  const handleNewProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value; // Handle checkbox differently
    setNewProduct(prevState => ({
      ...prevState,
      [name]: val
    }));
  };
  

  // Function to handle submission of new product
  const handleNewProductSubmit = async () => {
    try {
      console.log("this is the new product", newProduct);
  
      // Ensure price is a float and title is set
      newProduct.price = parseFloat(newProduct.price);
      newProduct.title = newProduct.name;
  
      // Destructure the newProduct to match the variables expected by the mutation
      const { name, description, title, type, price, isSpecial, img } = newProduct;
  
      await createProduct({ variables: { name, description, title, type, price, isSpecial, img } });
      toast.success('New product added successfully!');
  
      // Reset form fields after successful creation
      setNewProduct({
        name: '',
        description: '',
        title: '',
        type: '',
        price: 0,
        isSpecial: false,
        img: ''
      });
      refetchProducts();
    } catch (error) {
      console.error('Error adding new product:', error);
      toast.error('Failed to add new product.');
    }
  };
  
  const handleEditProduct = (product) => {
    setEditedProduct(product);
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct({ variables: { ...editedProduct } });
      toast.success('Product updated successfully!');
      setEditedProduct(null);
      refetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product.');
    }
  };


  // Function to handle deletion of a product
  const handleDeleteProduct = async (productID) => {
    try {
      await deleteProduct({ variables: { productID } });
      toast.success('Product deleted successfully!');
      refetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product.');
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
                    Date Created: {format(new Date(Number(review.dateCreated)), 'PPP')}
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="error" onClick={() => {
                      setSelectedReview(review.reviewID);
                      setModalOpen(true);
                    }}>Delete</Button>
                    {review.reviewText !== "[**** This review has been flagged due to inappropriate content ****]" && (
                    <Button variant="contained" color="primary" onClick={() => {
                    handleOpenFlagModal(review.reviewID);
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

        {/* Products Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Products</Typography>
              <Grid container spacing={2} sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                {products.map((product, index) => (
                  <Grid key={product.productID} item xs={12}>
                    <Card sx={{ p: 2 , backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0',}} >
                      <CardContent>
                        <Typography variant="h6">{product.name}</Typography>
                        <Typography>{product.description}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>Type: {product.type}</Typography>
                        <Typography variant="body2">Price: ${product.price.toFixed(2)}</Typography>
                        <Button onClick={() => handleEditProduct(product)} variant="outlined" color="primary" sx={{ mt: 1, mr: 1 }}>Edit</Button>
                        <Button onClick={() => handleDeleteProduct(product.productID)} variant="outlined" color="error" sx={{ mt: 1 }}>Delete</Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
  
        {/* Dialog for Editing Product */}
        <Dialog open={!!editedProduct} onClose={() => setEditedProduct(null)}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <DialogContentText>Make changes to the product details:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              value={editedProduct?.name || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={editedProduct?.description || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                value={editedProduct?.type || ''}
                onChange={(e) => setEditedProduct({ ...editedProduct, type: e.target.value })}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Dairy & Eggs">Dairy & Eggs</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Bakery">Bakery</MenuItem>
                <MenuItem value="Meat & Seafood">Meat & Seafood</MenuItem>
                <MenuItem value="Grains & Pasta">Grains & Pasta</MenuItem>
                <MenuItem value="Nuts & Seeds">Nuts & Seeds</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              id="price"
              label="Price"
              type="number"
              fullWidth
              value={editedProduct?.price || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
            />
            <TextField
              margin="dense"
              id="img"
              label="Image URL"
              type="text"
              fullWidth
              value={editedProduct?.img || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, img: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditedProduct(null)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Add New Product Form */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Add New Product</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                value={newProduct.name}
                onChange={handleNewProductChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={newProduct.description}
                onChange={handleNewProductChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type" // Ensure the name attribute is set to 'type'
                value={newProduct.type}
                onChange={handleNewProductChange}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Dairy & Eggs">Dairy & Eggs</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Bakery">Bakery</MenuItem>
                <MenuItem value="Meat & Seafood">Meat & Seafood</MenuItem>
                <MenuItem value="Grains & Pasta">Grains & Pasta</MenuItem>
                <MenuItem value="Nuts & Seeds">Nuts & Seeds</MenuItem>
              </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Price"
                type="number"
                value={newProduct.price}
                onChange={handleNewProductChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="img"
                name="img"
                label="Image URL"
                value={newProduct.img}
                onChange={handleNewProductChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={<Checkbox checked={newProduct.isSpecial} onChange={handleNewProductChange} name="isSpecial" />}
                label="Special Product"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleNewProductSubmit}>
                Add Product
              </Button>
            </Grid>
          </Grid>
        </Box>
        <PopularProductsChart />
      </Container>
    </ThemeProvider>
  );
}

export default AdminDashboard;
