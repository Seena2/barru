// when using plain JS and commonJs
/*
  const express = require("express");
  const dotenv = require("dotenv").config();
  const cors = require("cors");
  const colors = require("colors"); // colors the code output on the terminal
*/
// using TS and ES module
import express from "express";
import cors from 'cors';
import  {config} from 'dotenv';
import  {prisma,connectDB, disconnectDB} from './config/prisma.ts'
// Import routes
import authRoutes from './routes/authRoutes.ts'
import articleRoutes from './routes/articleRoutes.ts'
import editorRoutes from './routes/editorRoutes.ts'

const PORT = process.env.PORT || 5000;

config(); //initializes the dotenv config to access environmenal variables
connectDB();//connect to the DB

//init express app
const app = express();

//Middlewares
app.use(cors()); // Critical for allowing frontend requests
// Body parsing middlewares
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));
app.use(express.static("dist"));

// API Routes
// Home routes
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Welcome" });
// });
// Auth
// http://localhost:5001/auth/register
// http://localhost:5001/auth/login
app.use('/auth',authRoutes)

// User routes
// app.get("/api/users", (req, res) => {
//   res.status(200).send(usersList);
// });

// Article
// http://localhost:5001/article/create
app.use('/articles', articleRoutes)

// Editor routes
app.use('/editor', editorRoutes)


//Listen for request
const server = app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}...`);
});


//Handle unhandled promise rejections(e.g database connection errors)
process.on('unhandledRejection',(err)=>{
  console.error(`Unhandled Rejection:`,err);
  server.close(async()=>{
    await disconnectDB();
    process.exit(1)
  });
});

//Handle uncaught exceptions
process.on('uncaughtException', async(err)=>{
    console.error('Uncaught Exception:',err)
    await disconnectDB();
    process.exit(1)
});

//Gracefull shutdown
process.on('SIGTERM', async()=>{
  console.log("SIGTEM recieved, shutting down gracefully");
  server.close(async()=>{
    await disconnectDB();
    process.exit(0)
  });
});
