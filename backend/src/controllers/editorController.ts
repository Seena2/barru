import type { Request,Response } from 'express';
import { prisma } from "../config/prisma.ts";
/*
@desc: Assign Reviewer to article
@route: POST /editor/
@access: Private
*/
const assignReviewer = async (req: Request, res: Response) => {
  const editorId = req.user?.id; //get editor id from request object, which is set by authMiddleware after successful authentication
  const { articleId, reviewerId } = req.body;
  //check if the editor exists and valid: ensure only editor can assign the reviewer to article
  const editor = await prisma.user.findUnique({
    where: { id: editorId },
    omit: { password: true },
  });
  if (!editor) {
    return res.status(404).json({ error: "Editor not found" });
  } else if (editor.role !== "EDITOR" || !editor.isApprovedEditor) {
    return res
      .status(400)
      .json({ error: " Not authorized, only editor can assign reviewer" });
  }
  //check if the reviewer exists
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  if (!reviewer) {
    return res.status(404).json({ error: "Reviewer not found" });
  } else if (reviewer.role !== "REVIEWER" || !reviewer.isApprovedReveiwer) {
    return res
      .status(400)
      .json({ error: "user is not  reviewer or not approved to be reviewer" });
  }
  //  Check if article exists
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }
  // check if article has assigned reviewer, and the reviewer is different from the author
  const hasReviewer = await prisma.review.findUnique({
    where: {
      reviewerId_articleId: { reviewerId: reviewerId, articleId: articleId },
    },
  });
  if (hasReviewer) {
    return res
      .status(400)
      .json({ error: "Article already have assigned reviewer" });
  }
  // Verify the reviewer is different from the author
  if (reviewerId === article.authorId) {
    return res
      .status(400)
      .json({ error: "Reviewer can not review his own article" });
  }
  // create review: assign article to reviewer and connect it to user and  article table using article property
  try {
    const newComment = {
      //construct comment object
      comment: "Assigned article to reviewer",
      assignedBy: editor?.name,
      role: "Editor",
      commentedAt: new Date(),
    };
    const assignReviewer = await prisma.review.create({
      data: {
        reviewer: { connect: { id: reviewerId } }, //connects reviw to user(reviewer)
        article: { connect: { id: articleId } }, //connects to article
        comments: newComment,
      },
    });
    // Update article status form PENDING TO REVIEWING
    const updateArticleStatus = await prisma.article.update({
      where: { id: articleId },
      data: { status: "REVIEWING", updatedAt: new Date() },
    });
    res.status(201).json({
      status: "Success",
      data: assignReviewer,
      articleStatus: "REVIEWING",
    });
  } catch (error) {
    console.error("error assigning reviewer", error);
    res.status(400);
    throw new Error("error assigning reviewer");
  }
};

/*
@desc: Get review details for article
@route: GET /editor/:id
@access: Private
*/
const getReview = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get editor id from request object, which is set by authMiddleware after successful authentication
  // const { articleId, reviewerId } = req.body;
  const reviewId = req.params.id as string; //used the query parameter instead of request body to target specific review

  //check if the user exists and valid:
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  //  Check if article review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { article: true },
  });
  if (!review) {
    return res.status(404).json({ error: "Article review not found" });
    //ensure only editor, assigned reviewer and author(if owns the article) can view the review
  } else if (
    user.role !== "EDITOR" ||
    review.article.authorId !== userId ||
    review.reviewerId !== userId
  ) {
    return res.status(404).json({
      error: "Unauthorized, you don't have permission to view the article",
    });
  }
  // get review details
  try {
    res.status(201).json({ status: "Success", data: review });
  } catch (error) {
    console.error("error fetching review", error);
    res.status(400);
    throw new Error("error fetching review");
  }
};
/*
@desc: Update article Reviewer
@route: PUT /editor/:id
@access: Private
*/
const updateReviewer = async (req: Request, res: Response) => {
  const editorId = req.user?.id; //get editor id from request object, which is set by authMiddleware after successful authentication
  const { articleId, reviewerId } = req.body;
  const reviewId = req.params.id as string; //used the query parameter instead of request body to target specific review
  //check if the editor exists and valid: ensure only editor can remove the reviewer from article
  const editor = await prisma.user.findUnique({
    where: { id: editorId },
    omit: { password: true },
  });
  if (!editor) {
    return res.status(404).json({ error: "Editor not found" });
  } else if (editor.role !== "EDITOR" || !editor.isApprovedEditor) {
    return res
      .status(400)
      .json({ error: "Unauthorized, only editor can remove reviewer" });
  }
  //  Check if article review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { article: true },
  });
  if (!review) {
    return res.status(404).json({ error: "Article review not found" });
  }

  // Verify the reviewer is different from the author
  if (reviewerId === review.article.authorId) {
    return res
      .status(400)
      .json({ error: "Reviewer can not review his own article" });
  }
  // update review: assign article to reviewer using "update()" or "upsert()"
  try {
    const newComment = {
      //construct comment object
      comment: "updated article to reviewer",
      assignedBy: editor?.name,
      role: "Editor",
      commentedAt: new Date(),
    };
    const updateReviewer = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reviewer: { connect: { id: reviewerId } }, //connects reviw to user(reviewer)
        article: { connect: { id: articleId } }, //connects to article
        comments: newComment,
      },
    });
    // if the article have revoked its reviewer, demote the status to "PENDING"
    if (!review.reviewerId) {
      const articleStatus = await prisma.article.update({
        where: { id: articleId },
        data: { status: "PENDING" },
      });
    }
    res.status(201).json({
      status: "Success",
      data: updateReviewer,
      articleStatus: "PENDING",
    });
  } catch (error) {
    console.error("error updating reviewer", error);
    res.status(400).json({ error: "error updating reviewer" });
    throw new Error("error update reviewer");
  }
};
/*
@desc: Remove article Reviewer
@route: DELETE /editor/:id
@access: Private
*/
const removeReviewer = async (req: Request, res: Response) => {
  const editorId = req.user?.id; //get editor id from request object, which is set by authMiddleware after successful authentication
  // const { articleId, reviewerId } = req.body;
  const reviewId = req.params.id as string; //used the query parameter instead of request body to target specific review

  //check if the editor exists and valid: ensure only editor can remove the reviewer from article
  const editor = await prisma.user.findUnique({
    where: { id: editorId },
    include: { profile: true },
  });
  if (!editor) {
    return res.status(404).json({ error: "Editor not found" });
  } else if (editor.role !== "EDITOR" || !editor.isApprovedEditor) {
    return res
      .status(400)
      .json({ error: "Unauthorized, only editor can remove reviewer" });
  }
  //  Check if article review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { article: true },
  });
  if (!review) {
    return res.status(404).json({ error: "Article review not found" });
  }
  // remove review: remove article reviewer
  try {
    const removeReviewer = await prisma.review.delete({
      where: { id: reviewId },
    });
    // Update article status back to "PENDING",
    const updateArticleStatus = await prisma.article.update({
      where: { id: review.articleId },
      data: { status: "PENDING", updatedAt: new Date() },
    });
    res.status(201).json({ status: "Success", data: updateArticleStatus });
  } catch (error) {
    console.error("error removing reviewer", error);
    res.status(400);
    throw new Error("error removing reviewer");
  }
};
/*
@desc: Get all reviews -for admin purpose
@route: GET /editor/
@access: Private
*/
const getAllReviews = async (req: Request, res: Response) => {
  const editorId = req.user?.id; //get editor id from request object, which is set by authMiddleware after successful authentication

  //check if the editor exists and valid: ensure only editor can view the reviewer from article
  const editor = await prisma.user.findUnique({
    where: { id: editorId },
    include: { profile: true },
  });
  if (!editor) {
    return res.status(404).json({ error: "Editor not found" });
  } else if (editor.role !== "EDITOR" || !editor.isApprovedEditor) {
    return res
      .status(400)
      .json({ error: "Unauthorized, only editor can view reviews" });
  }
  // get all reviews: articles being reviewed
  try {
    const reviews = await prisma.review.findMany();
    res.status(201).json({ status: "Success", data: reviews });
  } catch (error) {
    console.error("error fetching review", error);
    res.status(400);
    throw new Error("error fetching review");
  }
};


export{assignReviewer, getReview, updateReviewer, removeReviewer, getAllReviews}