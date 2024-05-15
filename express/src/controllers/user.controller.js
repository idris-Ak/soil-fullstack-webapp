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
    const dateJoined = new Date().toLocaleDateString();
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
            res.send({ message: `Welcome ${user.name}!`, user: { id: user.id, name: user.name, email: user.email,  dateJoined: user.dateJoined.toLocaleDateString()} }); 
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
    const { name, password: { oldPassword, newPassword } } = req.body;
    try {
        const user = await db.user.findByPk(id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
            // Verify old password
            if (oldPassword && !(await bcrypt.compare(oldPassword, user.password))) {
                return res.status(401).send({ message: "Invalid old password." });
            }

        //If a new password is provided, hash it and update
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        //Update name if provided
        if (name) {
            user.name = name;
        }

        await user.save();


        //Find current user details in the database
        const updatedUser = await db.user.findOne({
            where: { id },
            attributes: ['id', 'name', 'email', 'dateJoined']
        });
        
        //Make sure the dateJoined is still in yyyy/mm/dd format 
        if (updatedUser) {
            //Make sure the dateJoined is still in yyyy/mm/dd format 
            updatedUser.dataValues.dateJoined = updatedUser.dateJoined.toLocaleDateString();
            res.json({ message: "User updated successfully.", user: updatedUser });
        } else {
            return res.status(404).send({ message: "User not found or no new data provided." });
        }
        
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

