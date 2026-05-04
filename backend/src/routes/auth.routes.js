const {userModel} = require("../models/user.model")
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod")
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

const zodSchema = z.object ({
    username : z.string().min(3,"put atleast 3 character").max(100,"maximum 100 character allow").trim(),
    email : z.string().trim().toLowerCase().email(),
    password: z.string().min(6, "minimum put 6 character in password").regex(/[A-Z]/, "At least one capital latter").
              regex(/[a-z]/, "At least one small latter").regex(/[0-9]/, "At least one number").
              regex(/[@$!%*?&]/, "At least one apecial character")
})

router.post("/signup",async function (req, res){
    const {username, email, password} = req.body;

    const parseData = zodSchema.safeParse(req.body);

    if(!parseData.success){
        return res.status(400).json(parseData.error)
    }

    const hashPassword = await bcrypt.hash(password, 10);

    try{
        const newUser = await userModel.create({
        username,
        email,
        password:hashPassword
    })
    res.status(201).json(newUser)

    }catch(e){
        res.status(500).json({message: e.message})

    }
    
})

router.post("/signin",async function (req, res){
    const {email, password} = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const verifiedUser = await bcrypt.compare(password, user.password);

    if(verifiedUser){
        const token = jwt.sign({
            userId : user._id
        },JWT_SECRET)

        res.json({token:token})
    }else{
        res.status(401).json({
            message:"Invalid email or password"
        })
    }
    
})


module.exports = {
   Authrouter:router
} 