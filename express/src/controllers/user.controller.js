const db = require("../database");
const bcrypt = require('bcryptjs');

exports.SignUp = async(req, res) => {
    const {name, email, password} = req.body;
    try{
        const existingUser = await db.user.findOne({where : {email}});
        if(existingUser){
            return res.status(409).send({message: "Email already registered."});
        }
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = await db.user.create({
        name,
        email,
        password: hashedPassword,
        dateJoined: new Date()
    });
    res.status(201).send({message: "Signup Successful!", user: {id: newUser.id, name: newUser.name}});
    }
    catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send({ message: "Error signing up", error: error.message });
    }
};

exports.Login = async(req, res) => {
    const {email, password} = req.body;
    try{
        const user = await db.user.findOne({where: {email}});
        if(user && await bcrypt.compare(password, user.password)) {
            res.send({message: `Welcome ${user.name}!`});
        }
        else{
            res.status(401).send({message: "Invalid Email/Password"});
        }
    }
    catch(error){
        res.status(500).send({message: "Error logging in", error: error.message});
    }
}; 
