import express from 'express';
// import type { Request,Response } from 'express';
import { authMiddleware } from "../middleware/authMiddleware.ts";
import {
  setArticle,
  deleteArticle,
  getAllArticle,
  getArticle,
  getArticles,
  updateArticle,
} from "../controllers/articleController.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { articleSchema } from "../validators/articleValidator.ts";

// intialize router
const router = express.Router();

// apply the auth middleware to all routes
router.use(authMiddleware);

// POST : create article
// router.post('/',(req:Request,res:Response)=>{
//     res.status(200).json({message:'create new article'});
// })
router.post("/", validateRequest(articleSchema), setArticle);
// GET : get all articles, authored by current user
// router.get("/", (req: Request, res: Response) => {
//   res.status(200).json({ message: "Get all articles" });
// });
router.get("/", getArticles);
// GET: get single article
router.get("/:id", getArticle);
//PUT/UPDATE : need to specify the id of the article to update
// router.put('/:id',(req:Request,res:Response)=>{
//     res.status(200).json({message:'update article ${req.params.id}'});
// })
router.put("/:id", validateRequest(articleSchema), updateArticle);
//DELETE
// router.delete('/:id',(req:Request,res:Response)=>{
//     res.status(200).json({message:'Delete article ${req.params.id}'});
// })
router.delete("/:id", deleteArticle);

// ADMIN ROUTES
//GET : get all articles by all authors
router.get("/", getAllArticle);

export default router;