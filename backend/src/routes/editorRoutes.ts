import express from 'express';
import { assignReviewer } from '../controllers/editorController.ts';

// intialize router
const router= express.Router();

//Assign reviewer to article
router.post('/',assignReviewer)
//Login user
// router.post('/login',login)
// // logout user
// router.post('/logout',logout)

export default router;