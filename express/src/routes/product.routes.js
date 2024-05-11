module.exports = (express, app) => {
    const controller = require("../controllers/product.controller.js");
    const router = express.Router();
  
    router.post('/', controller.addProduct);

    // get specials
    // GET request to fetch all products
    router.get('/', controller.getAllProducts);  

      // Add routes to server.
      app.use("/api/product", router);
  
  };