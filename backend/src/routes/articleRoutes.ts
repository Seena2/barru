import express from 'express';
import type { Request,Response } from 'express';

// intialize router
const router= express.Router();
// GET
router.get('/',(req:Request,res:Response)=>{
    res.status(200).json({message:'Get all articles'});
})
// POST
router.post('/',(req:Request,res:Response)=>{
    res.status(200).json({message:'create new article'});
})
//PUT/UPDATE : need to specify the id of the article to update
router.put('/:id',(req:Request,res:Response)=>{
    res.status(200).json({message:'update article ${req.params.id}'});
})
//DELETE
router.delete('/:id',(req:Request,res:Response)=>{
    res.status(200).json({message:'Delete article ${req.params.id}'});
})

export default router;