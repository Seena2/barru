import express from 'express';
import { register, login, logout } from '../controllers/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { loginSchema, registerSchema} from "../validators/authValidator.ts";

// intialize router
const router= express.Router();

//Register user
router.post('/register',validateRequest(registerSchema),register)//applied validator
//Login user
router.post('/login',validateRequest(loginSchema),login) //appied valdiator
// logout user
router.post('/logout',logout) //no validator

export default router;