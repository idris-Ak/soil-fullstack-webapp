const express = require("express");
const cors = require("cors");
const db = require("./src/database");

// Database will be sync'ed in the background.
db.sync();

const app = express();

// Parse requests of content-type - application/json.
app.use(express.json());

// Add CORS suport.
app.use(cors());

// Simple Hello World route.
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

// Add user routes.
// examples
require("./src/routes/user.routes.js")(express, app);
require("./src/routes/product.routes.js")(express, app);
require("./src/routes/shoppingCart.routes.js")(express, app);
require("./src/routes/admin.routes.js")(express, app);
require("./src/routes/adminActions.routes.js")(express, app);
require("./src/routes/cartItem.routes.js")(express, app);
require("./src/routes/review.routes.js")(express, app);
require("./src/routes/moderateReview.routes.js")(express, app);

// Set port, listen for requests.
db.sequelize.sync().then(() => {
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
});
