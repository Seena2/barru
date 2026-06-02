import express from 'express';
import type { Request,Response } from 'express';
import { authMiddleware } from "../middleware/authMiddleware.ts";
import {
  deleteArticle,
  getAllArticle,
  getArticle,
  getArticles,
  setArticle,
  updateArticle,
} from "../controllers/articleController.ts";

// intialize router
const router = express.Router();

// apply the auth middleware to all routes
router.use(authMiddleware);

// POST : create article
// router.post('/',(req:Request,res:Response)=>{
//     res.status(200).json({message:'create new article'});
// })
router.post("/create", setArticle);
// GET : get all articles
// router.get("/", (req: Request, res: Response) => {
//   res.status(200).json({ message: "Get all articles" });
// });
router.get("/articles", getArticles);
// GET: get single article
router.get("/article", getArticle);
//PUT/UPDATE : need to specify the id of the article to update
// router.put('/:id',(req:Request,res:Response)=>{
//     res.status(200).json({message:'update article ${req.params.id}'});
// })
router.put("/:id", updateArticle);
//DELETE
// router.delete('/:id',(req:Request,res:Response)=>{
//     res.status(200).json({message:'Delete article ${req.params.id}'});
// })
router.delete("/:id", deleteArticle);

// ADMIN ROUTES
//GET : get all articles by all authors
router.get("/", getAllArticle);

export default router;