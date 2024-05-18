const db = require("../database");

exports.AddtoCart = async (req, res) => {
    try {
        const { cartID, productID, quantity, price } = req.body;
        if (!cartID || !productID || !quantity || !price) {
            return res.status(400).json({ error: "All fields are required" });
        }
         await db.cartItem.create({
            cartID,
            productID,
            quantity,
            price,
            });
      res.status(200).json({ message: "Item added to cart successfully",  });
    } catch (error) {
      console.error("Error AddtoCart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.GetItems = async (req, res) => {
    try {
        const { cartID } = req.params; // Use req.query instead of req.body
        if (!cartID) {
            return res.status(400).json({ error: "cartID is required" });
        }

        const userItems = await db.cartItem.findAll({ // Corrected to db.CartItem
            where: {
                cartID: cartID,
            },
        });
        res.json(userItems); // This will return an empty array if no items are found
    } catch (error) {
        console.error("Error getting cart items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
