import type { Request,Response } from 'express';
import { prisma } from '../config/prisma.ts';

/*
@desc: Assign Reviewer to article
@route: POST /editor/assignreviewer
@access: Private
*/
const assignReviewer = async(req:Request,res:Response)=>{
    const {articleId,reviewerId}= req.body;
    const editorId=req.user?.id;//get editor id from request object, which is set by authMiddleware after successful authentication 
    const editor = await prisma.user.findUnique({where:{id:editorId}})
    //  Check if article exists
    const article = await prisma.article.findUnique({where:{id:articleId}});
    if(!article){
        return res.status(404).json({error:"Article not found"})
    }
     // check if article has assigned reviewer, and the reviewer is different from the author
    const hasReviewer= await prisma.review.findUnique(
        {where:{reviewerId_articleId:{reviewerId:reviewerId,articleId:articleId}},
    });
     if(hasReviewer){
        return res.status(400).json({error:"Article already have assigned reviewer"});
    }
     // Verify the reviewer is different from the author
     if(reviewerId === article.authorId){
        return res.status(400).json({error:"Reviewer can not review his own article"});
    }
    // create review: assign article to reviewer
    try {
        const newComment= { //construct comment object 
            comment:"Assigned article to revier",
            assignedBy: editor?.name, role: "Editor",
            commentedAt : new Date(),
        }  
        const assignReviewer = await prisma.review.create({
            data:{reviewerId, articleId,comments:newComment}
        });
        res.status(201).json({ status:"Success", data:assignReviewer});
    } catch (error) {
        console.error("error assigning reviewer",error)
        res.status(400);
        throw new Error('error assigning reviewer');
    }
    // Update article status
    const updateAtricle= await prisma.article.update({
        where:{id:articleId},
        data:{status:"REVIEWING", updatedAt:new Date()},
    });
}

/*
@desc: authenticate user(login)
@route: POST /auth/login
@access: Public
*/
const login = async(req:Request,res:Response)=>{
    // const {email,password}= req.body;
    // //  Check if user email exists in user table
    // const user= await prisma.user.findUnique({where:{email:email}});
    // if(!user){
    //     return res.status(401).json({error:"Invalid credentails"})
    // }
    // // Verify password
    // const isPasswordValid = await bcrypt.compare(password,user.password)
    // if(!isPasswordValid){
    //     return res.status(401).json({error:"Invalid credentails"}) 
    // }
    // // Generate JWT token
    // const token= generateToken(user.id, res);

    // //return user data and token
    // res.status(201).json({
    //     status: 'success',
    //     data:{ user:{id:user.id, email:email}},
    //     token
    // });
}


/*
@desc: Logout: logout user and clear the cockie containing the access token
@route: POST /auth/logout
@access: Public
*/
const logout = async(req:Request,res:Response)=>{
    // // Crear the cookie containig the access token using response object
    // res.cookie("jwt"," ", {
    //     httpOnly: true,
    //     expires:new Date(0)})
    
    // //return user data and token
    // res.status(200).json({
    //     status: 'success',
    //     message:"Logged out successfully",
    // });
}

export{assignReviewer, login, logout}