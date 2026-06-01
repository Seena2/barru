import express from 'express';
import { register, login, logout } from '../controllers/authController.ts';

// intialize router
const router= express.Router();

// apply auth middleware that runs before every request is processed

//Register user
router.post('/register',register)
//Login user
router.post('/login',login)
// logout user
router.post('/logout',logout)

export default router;