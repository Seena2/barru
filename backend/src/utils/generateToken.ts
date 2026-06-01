import jwt from 'jsonwebtoken';
import  type { Request, Response } from 'express';

const generateToken=(userId:string,res:Response)=>{
    const payload = {id: userId}
    const secret= process.env.JWT_SECRET as string; //cast to string
    const expires = process.env.JWT_EXPIRES_IN;

    if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
    }
    
    // constract the token using the payload and secret
    const token = jwt.sign(payload, secret, {expiresIn: (expires as any) || "7d"});
    // set the token on user cookie via response object
    res.cookie('jwt',token,{
        httpOnly:true, //prevent frontside code from accessing the token
        secure: process.env.NODE_ENV ==='production', //use it only in production
        sameSite:"strict", //prevents the  browser from sending cookie on cross-site request, to protect agains CSRF attacks 
        maxAge: (1000*60*60*24)*7, //expiration : 7 days
    })
    return token;
}

export default generateToken;