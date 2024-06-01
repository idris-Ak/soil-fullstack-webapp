module.exports = (express, app) => {
    const controller = require("../controllers/product.controller.js");
    const router = express.Router();
  
    router.post('/', controller.addProduct);

    // GET request to fetch all products
    router.get('/', controller.getAllProducts); 

    router.get('/specials', controller.getSpecialProducts);  
    router.get('/:id', controller.getProduct);


      // Add routes to server.
      app.use("/api/product", router);
  
  };