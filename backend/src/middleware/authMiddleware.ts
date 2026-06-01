import jwt from 'jsonwebtoken';
import {prisma} from '../config/prisma.ts'
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const authMiddleware: RequestHandler = async ( req: Request, res: Response,  next: NextFunction) => {
    let token;
    // check if the token is available in the request header or cookies
    const authHeader = req.headers.authorization; //authorization header starts with "Bearer": "Bearer tokenValue_ahkhjlajlkgjlgjkljklsajgl", 
    const tokeninCookie = req.cookies?.jwt //"jwt" is name we gave for our cookie when we generated the token in the generateToken() helper fucntion
    if (authHeader?.startsWith('Bearer ')) {
    // extract the token from header by spliting  at " " (the 2nd substring)
     token = authHeader.split(' ')[1]; //["Bearer", "tokenValue_ahkhjlajlkgjlgjkljklsajgl"]
    }else if(tokeninCookie){
        token= tokeninCookie;
    }
    // if no token is found both in header and cookie, return unauthorized error
    if(!token){
         return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    try {
        // Verify the token and extract the userId from the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId =decoded.id;
        const user = await prisma.user.findUnique({
            where:{id:userId},
             omit: { password: true }, // Removes the password field from the payload when fetching user, for security reasons
            });
        if(!user){
            return res.status(401).json({message:'Unauthorized: User not found'})
        }
        // Attach user payload to request object for use in subsequent handlers
        req.user=user;

        next(); // Pass control to the next handler
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};