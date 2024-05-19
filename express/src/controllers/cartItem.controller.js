const db = require("../database");

exports.AddtoCart = async (req, res) => {
    try {
      const { cartID, productID, quantity, price } = req.body;
      if (!cartID || !productID || !quantity || !price) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const newItem = await db.cartItem.create({
        cartID,
        productID,
        quantity,
        price,
      });
      res.status(200).json({ message: "Item added to cart successfully", cartItemID: newItem.cartItemID });
    } catch (error) {
      console.error("Error AddtoCart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
exports.DeleteItemFromCart = async (req, res) => {
    try {
      const { itemId } = req.params;
      const deleted = await db.cartItem.destroy({
        where: {
          cartItemID: itemId
        }
      });
      if (deleted) {
        res.status(200).json({ message: "Item deleted from cart successfully" });
      } else {
        res.status(404).json({ error: "CartItem not found" });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

exports.EditItemCount = async (req, res) => {

    try{
        const { itemId } = req.params;
        const  newAmount  = req.body.quantity;
        console.log("item id", itemId)
        console.log("1.newAmount", req.body.quantity)
        console.log("2.newAmount", newAmount)

        const [updated] =  await db.cartItem.update(
            {
                quantity: newAmount
            },
            {
            where:{ 
                cartItemID: itemId 
            }
        });

        if (updated) {
            const updatedCartItem = await db.cartItem.findOne({ where: { cartItemID: itemId } });
            res.status(200).json({ cartItem: updatedCartItem });
        } else {
            // If no rows were updated, respond with a 404 status
            res.status(404).json({ error: "CartItem not found" });
        }
    } catch (error) {
        // Handle any errors
        console.error("Error updating cart item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.GetItems = async (req, res) => {
    try {
        const { cartID } = req.params; 
        if (!cartID) {
            return res.status(400).json({ error: "cartID is required" });
        }

        const userItems = await db.cartItem.findAll({ 
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
