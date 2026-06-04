import express from 'express';
import { register, login, logout } from '../controllers/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { authSchema } from '../validators/authValidator.ts';

// intialize router
const router= express.Router();

// apply auth middleware that runs before every request is processed

//Register user
router.post('/register',validateRequest(authSchema),register)//applied validator
//Login user
router.post('/login',validateRequest(authSchema),login) //appied valdiator
// logout user
router.post('/logout',logout) //no validator

export default router;