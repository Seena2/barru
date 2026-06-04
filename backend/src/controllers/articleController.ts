import type { Request, Response } from "express";
import { prisma } from "../config/prisma.ts";

/*
@desc: set article 
@route: POST /articles/
@access: Private
*/
const setArticle = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const {title, abstract, fileUrl, fileType, articleType, pages, submitedFor, journalType, status, notes, publishedDate} = req.body;
  // Validate required fields
if(! title || !fileUrl || !fileType || !articleType || !submitedFor){
  return res.status(400).json({ message: "Missing required fields" });
}

  //check if user is valid, completed profile and his role is "AUTHOR"
  const user = await prisma.user.findUnique({ where: {id:userId}, include: {profile:true}})
  if(!user || !user.profile || user.profile.role !== "AUTHOR"){
    return res.status(403).json({message: "Unauthorized to submit article, register as user, complete your profile and make sure your role is AUTHOR"});
  }

  // check if the user has already submitted an article with the same title
  const existingArticle = await prisma.article.findUnique({
      where: {
         title_authorId_fileUrl: { //composite unique field defined in the articles table
            title: "Your Article Title",
            authorId: userId,
            fileUrl: fileUrl
    }
  }
  });
  if(existingArticle){
    return res.status(400).json({message: "An article with the same title already exists, please choose a different title"});
  }

  try {
    //create a article
    const newArticle = await prisma.article.create({
      data: { title, abstract, fileUrl, fileType, articleType, pages, submitedFor, journalType, status, notes,
        publishedDate: new Date(),
        author: { connect: { id: userId } }, // Add the required author using "connect:" property
      },
    });

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: "error creating article" });
  }
};

/*
@desc: get all articles authered by current user
@route: GET /articles/
@access: Private
*/
const getArticles = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  //check if user is valid, 
  const user = await prisma.user.findUnique({ where: {id:userId}})
  if(!user){
    return res.status(400).json({message: "User not found"})
  }
  try{
    // Query an Author and their Articles: Use the include option to retrieve the relational data
      const articles = await prisma.user.findMany({where: { id: userId },
        include: { articlesAuthored: true, articlesCoAuthored:true }, // Returns an array of articles
        
    });
    res.status(201).json(articles);
  } catch (error) {
    res.status(500).json({ message: "error fetching articles" });
  }
}

/*
@desc: get specific article
@route: GET /articles/:id
@access: Private
*/
const getArticle = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const articleId = req.params.id as string;// get specific article id from query parameter

  //check if user is valid, 
  const user = await prisma.user.findUnique({ where: {id:userId}, include:{profile:true}})
  if(!user){
    return res.status(400).json({message: "User not found"})
  }
  // check if the article exists and belong to current user, 
  const article = await prisma.article.findUnique({where:{id:articleId}})
  if(!article){
     return res.status(400).json({message: "Article not found"})
  }
  // restrict access only to author, editor or addmin
  if(userId !== article.authorId && user.profile?.role !== "EDITOR" && user.profile?.role !== "ADMIN" ){
     return res.status(400).json({message: "Unauthorized, you don't have the permission to view the article"})
  }
    res.status(201).json(article);
}
/*
@desc: Update article
@route: PUT /articles/:id
@access: Private
*/
const updateArticle = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const articleId = req.params.id as string;// get specific article id from query parameter
    const {title, abstract, fileUrl, fileType, articleType, pages, submitedFor, journalType, status, notes, publishedDate} = req.body;
  // Validate required fields
if(! title || !fileUrl || !fileType || !articleType || !submitedFor){
  return res.status(400).json({ message: "Missing required fields" });
}

  //check if user is valid, completed profile and his role is "AUTHOR"
  const user = await prisma.user.findUnique({ where: {id:userId}, include: {profile:true}})
  if(!user || !user.profile || user.profile.role !== "AUTHOR"){
    return res.status(403).json({message: "Unauthorized to submit article, register as user, complete your profile and make sure your role is AUTHOR"});
  }
  // check if the article exists and belong to current user
  const article = await prisma.article.findUnique({where:{id:articleId}})
  if(!article){
     return res.status(400).json({message: "Article not found"})
  }
  if(userId!==article.authorId){
     return res.status(400).json({message: "Unauthorized, you don't have the permission to update the article"})
  }
  try{
    // Query an Author and their Articles: Use the include option to retrieve the relational data
    // Link an Existing Article to a New or Existing Author, You can use the connect operator to assign an author to an article:
      const updatedArticle = await prisma.article.update({where: { id: articleId},
    data: {
        title, abstract, fileUrl, fileType, articleType, pages, submitedFor, journalType, status, notes,
        publishedDate: new Date,
        author: {
          connect: { id: userId }, // Connects existing Author with ID 
        },
      },
    });
    res.status(201).json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: "error updating articles" });
  }
}
/*
@desc: Delete article
@route: DELETE /articles/:id
@access: Private
*/
const deleteArticle = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
 const articleId = req.params.id as string;// get specific article id from query parameter
  //check if user is valid, 
  const user = await prisma.user.findUnique({ where: {id:userId}, include: {profile:true}})
  if(!user){
    return res.status(400).json({message: "User not found"})
  }
  // check if the article exists and belong to current user
  const article = await prisma.article.findUnique({where:{id:articleId}})
  const title= article?.title;
  if(!article){
     return res.status(400).json({message: "Article not found"})
  }
  if(userId!==article.authorId){
     return res.status(400).json({message: "Unauthorized, you don't have the permission to delete the article"})
  }
  try{
    // Delete article
      const deleteArticle = await prisma.article.delete({where: { id: articleId},
    });
    res.status(201).json({message:`deleted atrticle: ${title} successfully`});
  } catch (error) {
    res.status(500).json({ message: "error deleting articles" });
  }
}

// ADMIN ROUTES
/*
@desc: get all article
@route: GET /article/aritcles
@access: Private
*/
const getAllArticle = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  //check if user is valid, 
  const user = await prisma.user.findUnique({ where: {id:userId}, include: {profile:true}})
  if(!user){
    return res.status(400).json({message: "User not found"})
  }
  if(user.profile?.role!=="ADMIN"){
    return res.status(400).json({message: "Unauthorized, you don't have the permission to view articles"})
  }
  try{
    // fetch all articles
    const allArticles = await prisma.article.findMany();
    res.status(201).json(allArticles);
  } catch (error) {
    res.status(500).json({ message: "error fetching articles" });
  }
}

export {setArticle, getArticles, getArticle, updateArticle, deleteArticle, getAllArticle}

