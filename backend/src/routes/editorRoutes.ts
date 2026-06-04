import express from 'express';
import {
  assignReviewer,
  getReview,
  removeReviewer,
  updateReviewer,
} from "../controllers/editorController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

// intialize router
const router = express.Router();
// apply authMiddleware to router, so that all routes defined on the router can be authenticated
router.use(authMiddleware);

//Assign reviewer to article
router.post("/", assignReviewer);
//get review
router.put("/:id", getReview);
//update reviewer
router.put("/:id", updateReviewer);
// remove reviewer
router.delete("/:id", removeReviewer);

export default router;