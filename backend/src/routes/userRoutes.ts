import express from 'express';
import {
  deleteProfile,
  getAllUsers,
  getProfile,
  setProfile,
  updateProfile,
} from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

// intialize router
const router = express.Router();

// apply auth middleware to all routes in this router (runs before every request is processed)
router.use(authMiddleware);
//Create user profile
// Apply middleware to specific route(add it as 2nd argument in the route definition),i.e. only authenticated users can access the "/create" route to create user profile,
// router.post('/create',authMiddleware,createProfile)  //protecting specific route
router.post("/create", setProfile);
// Get user profile
router.get("/:id", getProfile);

// Update user profile
router.put("/:id", updateProfile);
// Delete user profile
router.delete("/:id", deleteProfile);

// ADMIN ROUTES
// get all users profile
router.get("/admin", getAllUsers);


export default router;