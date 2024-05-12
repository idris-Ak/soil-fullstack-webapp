const db = require("../database");

// Create a Product in the database.
exports.addProduct = async (req, res) => {
    try{        
        const product = await db.product.create({ 
            name: req.body.name,
            img: req.body.img,
            description: req.body.description,
            type: req.body.type,
            isSpecial: req.body.isSpecial,
            price: req.body.price,
        });
        console.log("Product created",  req.body.name);

        res.json(product);
    }
    catch(error){
        console.error("Error creating product:", error);
        // Handle error appropriately, e.g., send an error response
        res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  // Function to fetch all products
  exports.getAllProducts = async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await db.product.findAll();

        // Send the products as JSON response
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error appropriately, e.g., send an error response
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// Function to fetch Special products
exports.getSpecialProducts = async (req, res) => {
    try {
        // Fetch all products from the database
        const Specialproducts = await db.product.findAll({
            where: {
                isSpecial: true,
            },
        });

        // Send the products as JSON response
        res.json(Specialproducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error appropriately, e.g., send an error response
        res.status(500).json({ error: "Internal Server Error" });
    }
};