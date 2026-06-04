import express from 'express';
import {
  deleteProfile,
  getAllUsers,
  getProfile,
  setProfile,
  updateProfile,
} from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import { profileSchema } from "../validators/userValidator.ts";

// intialize router
const router = express.Router();

// apply auth middleware to all routes in this router (runs before every request is processed)
router.use(authMiddleware);
//Create user profile
// Apply middleware to specific route(add it as 2nd argument in the route definition),i.e. only authenticated users can access the "/" route to create user profile,
// router.post('/',authMiddleware,createProfile)  //protecting specific route
router.post("/", validateRequest(profileSchema), setProfile);
// Get user profile
router.get("/:id", validateRequest(profileSchema), getProfile);
// Update user profile
router.put("/:id", validateRequest(profileSchema), updateProfile);
// Delete user profile
router.delete("/:id", deleteProfile);
// Shorthand  to apply middleware separately to each route
// router.route("/:id").get( authMiddleware,getProfile).put(authMiddleware, updateProfile).delete(authMiddleware, deleteProfile)
// router.route("/:id").get( getProfile).put(updateProfile).delete(deleteProfile)

// ADMIN ROUTES
// get all users profile
router.get("/", validateRequest(profileSchema), getAllUsers);

export default router;