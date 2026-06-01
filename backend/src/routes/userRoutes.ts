import express from 'express';
import {createProfile} from '../controllers/userController.ts'
import { authMiddleware } from '../middleware/authMiddleware.ts';

// intialize router
const router= express.Router();

// apply auth middleware to all routes in this router (runs before every request is processed)
router.use(authMiddleware) 
// Apply middleware to specific route(add it as a second argument in the route definition) 
// this means that only authenticated users can access the /create route to create user profile,
//create user profile
router.post('/create',authMiddleware,createProfile)    
// //Login user
// router.post('/login',login)

// // logout user
// router.post('/logout',logout)

export default router;