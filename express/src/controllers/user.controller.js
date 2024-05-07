const db = require("../database");
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.SignUp = async(req, res) => {
    const {name, email, password} = req.body;
    try{
        //Check for existing email
        const existingUser = await db.user.findOne({where : {email}});
        if(existingUser){
            //If an email is already registered, alert the user
            return res.status(409).send({message: "Email already registered."});
        }
    //Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); 
    //Get the date joined from the database without the time
    const dateJoined = new Date().toISOString().split('T')[0];
    //Create a new user and store details in the database
    const newUser = await db.user.create({
        name,
        email,
        password: hashedPassword,
        dateJoined: dateJoined
    });
    res.status(200).send({user: {id: newUser.id, name: newUser.name}});
    }
    catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send({ message: "Error signing up", error: error.message });
    }
};

exports.Login = async(req, res) => {
    const {email, password} = req.body;
    try{
        //Find the user details from the database
        const user = await db.user.findOne({where: {email}});
        //Compare inputted password and password in the database to give access to user
        if(user && await bcrypt.compare(password, user.password)) {
            res.send({ message: `Welcome ${user.name}!`, user: { id: user.id, name: user.name, email: user.email,  dateJoined: user.dateJoined.toISOString().split('T')[0] } }); 
        }
        else{
            res.status(401).send({message: "Invalid Email/Password"});
        }
    }
    catch(error){
        res.status(500).send({message: "Error logging in", error: error.message});
    }
}; 

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password} = req.body;
    try {
        //Check if the new email inputted through editing user details is the same as the the ones in the database 
        if (email) {
            const existingUser = await db.user.findOne({
                where: {
                    email: email,
                    id: { [Op.ne]: id }
                }
            });
            //If the new email is the same as an email stored in the database, send an error to the user
            if (existingUser) {
                return res.status(409).send({ message: "Email already registered to another user." });
            }
        }

        const updates = { name, email };
       //Check if a new password has been provided and hash it
       if (password && password.trim()) {
        updates.password = await bcrypt.hash(password, 10);
        }

        //Update user details in the database
         const result = await db.user.update(updates, {
            where: { id }
        });

        //Check if the update operation was successful or not
        if (result == 0) {
            return res.status(404).send({ message: "User not found or no new data provided." });
        }

        //Find current user details in the database
        const updatedUser = await db.user.findOne({
            where: { id },
            attributes: ['id', 'name', 'email', 'dateJoined']
        });
        
        //Make sure the dateJoined is still in yyyy/mm/dd format 
        updatedUser.dataValues.dateJoined = updatedUser.dateJoined.toISOString().split('T')[0];
        res.json({ message: "User updated successfully.", user: updatedUser });
        
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send({ message: "Error updating user", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        //Delete the current user from the database when the user chooses to delete their profile
        const result = await db.user.destroy({
            where: { id }
        });
        //Send a success message if successful otherwise send an error message 
        if (result > 0) {
            res.send({ message: "User successfully deleted." });
        } else {
            res.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
};

