import express from 'express';
import {
  assignReviewer,
  getReview,
  removeReviewer,
  updateReviewer,
} from "../controllers/editorController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { reviewSchema } from "../validators/reviewValidator.ts";

// intialize router
const router = express.Router();
// apply authMiddleware to router, so that all routes defined on the router can be authenticated
router.use(authMiddleware);

//Assign reviewer to article
router.post("/", validateRequest(reviewSchema), assignReviewer);
//get review
router.get("/:id", getReview);
//update reviewer
router.put("/:id", validateRequest(reviewSchema), updateReviewer);
// remove reviewer
router.delete("/:id", removeReviewer);

export default router;