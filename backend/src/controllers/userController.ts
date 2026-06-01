import type { Request,Response } from 'express';
import { prisma } from '../config/prisma.ts';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.ts';


/*
@desc: create profile for user
@route: POST /users/<userId>/profile
@access: Private
*/
const createProfile=async(req:Request, res:Response)=>{
  const userId= req.user?.id;//get userId from auth middleware that we attached to req.user when the user is authenticated 
  const {bio} = req.body;
  try{
    //check if user already has a profile
    const existingProfile = await prisma.profile.findUnique({where:{userId}});
    if(existingProfile){
      return res.status(400).json({message:'Profile already exists for this user'});
    }
    // verify the user is authenticated and we have their userId available from the auth middleware, then we can create a profile for that user by connecting it to their userId in the database.
    
    //create profile for user
    const profile = await prisma.profile.create({
      data:{
        bio,
        user:{connect:{id:userId}}//connects the profile to the existing user by their userId, this assumes that the user is already authenticated and we have their userId available from the auth middleware   
      }
    })
  }catch(error){
    res.status(500).json({message:"Server error while creating profile"})
  }
}
/*
@desc: Get user profile
@route: GET api/users/userId
@access: Private
*/
const getMyProfile = async(req:Request,res:Response)=>{
  //get userId
    const userId = req.user?.id;
   //To fetch a user and include their related profile:
const userWithProfile = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true, // Returns the Profile object or null
  },
})
}

// Use the create method to build both the user and their related profile at the same time:
const newUser = await prisma.user.create({
  data: {
    email: "alice@example.com",
    profile: {
      create: {
        bio: "Hello, I love coding!",
      },
    },
  },
})

// Use update to link an existing profile to an existing user (or create one if it doesn't exist):
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      upsert: {
        create: { bio: "New bio" },
        update: { bio: "Updated bio" },
      },
    },
  },
})

// author- article: one to many
// Create an Author with an Article
const author = await prisma.author.create({
  data: {
    name: 'Jane Doe',
    articles: {
      create: {
        title: 'Introduction to Prisma 7',
        content: 'Prisma 7 makes type-safe database queries easier...'
      }
    }
  }
})
// Query an Author and their Articles: Use the include option to retrieve the relational data
const authorWithArticles = await prisma.author.findUnique({
  where: { id: 1 },
  include: {
    articles: true // Returns an array of articles
  }
})
// Link an Existing Article to a New or Existing AuthorYou can use the connect operator to assign an author to an article:
const updatedArticle = await prisma.article.update({
  where: { id: 5 },
  data: {
    author: {
      connect: { id: 1 } // Connects existing Author with ID 1
    }
  }
})
// 

export {createProfile,getMyProfile}