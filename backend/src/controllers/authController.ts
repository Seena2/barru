import type { Request,Response } from 'express';
import { prisma } from '../config/prisma.ts';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.ts';

/*
@desc: Register new user
@route: POST /auth/register
@access: Public
*/
const register = async(req:Request,res:Response)=>{
     const {name,email,password}= req.body;
    //  Validate user data
    if(!name || !email || !password){
        return res.status(400).json({error:"Please add all fields"});
    }
    //  Check if user already exists
    const userExists = await prisma.user.findUnique({where:{email:email}});
    if(userExists){
        return res.status(400).json({error:"User with this email already exists."})
    }
    try {
       // Hash password
        const salt= await bcrypt.genSalt(10); //generate salt
        const hashedPassword = await bcrypt.hash(password,salt)
        //create the user
        const newUser= await prisma.user.create({
            data:{name,email,password:hashedPassword}
        });
        // Generate JWT token
        const token= generateToken(newUser.id, res);
        // return user data along access token
        res.status(400).json({
            status: 'success',
            data:{ user:{id:newUser.id, name:name, email:email}},
            token
        });  
    } catch (error) {
        console.error("error registering user",error)
        res.status(400);
        throw new Error('Invalid user data')
    }
}

/*
@desc: authenticate user(login)
@route: POST /auth/login
@access: Public
*/
const login = async(req:Request,res:Response)=>{
    const {email,password}= req.body;
    //  Check if user email exists in user table
    const user= await prisma.user.findUnique({where:{email:email}});
    if(!user){
        return res.status(401).json({error:"Invalid credentails"})
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(401).json({error:"Invalid credentails"}) 
    }
    // Generate JWT token
    const token= generateToken(user.id, res);

    //return user data and token
    res.status(201).json({
        status: 'success',
        data:{ user:{id:user.id, email:email}},
        token
    });
}


/*
@desc: Logout: logout user and clear the cockie containing the access token
@route: POST /auth/logout
@access: Public
*/
const logout = async(req:Request,res:Response)=>{
    // Crear the cookie containig the access token using response object
    res.cookie("jwt"," ", {
        httpOnly: true,
        expires:new Date(0)})
    
    //return user data and token
    res.status(200).json({
        status: 'success',
        message:"Logged out successfully",
    });
}

export{register, login, logout}