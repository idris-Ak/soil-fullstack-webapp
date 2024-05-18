const db = require("../database");

exports.InitialiseCart = async (req, res) => {
    try{
        const {userID} = req.body;
        const Cart = await db.shoppingCart.create({ 
            userID,
        });
        console.log("shopping Cart Initialised for ",  userID);

        res.json(Cart);

    }
    catch(error){
        console.error("Error creating Initialising :", error);
        // Handle error appropriately, e.g., send an error response
        res.status(500).json({ error: "Internal Server Error" });
    }

}

exports.GetCartItems = async (req, res) => {
    try {
        const { userID } = req.query; 
        console.log("GetCartItems controller userId:", userID);
        const Cart = await db.shoppingCart.findAll({ where: { userID } });
        res.json(Cart);  // Return the first cart if multiple are found
    } catch (error) {
        console.error("Error fetching Cart ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};