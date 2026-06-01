import { PrismaClient } from "@prisma/client"; // if the client is generated to "node_modules"
// import { PrismaClient } from '@generated/prisma'; // if the client is generated to(../src/generated/prisma"
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";
import {PrismaNeon} from '@prisma/adapter-neon'; //adapter for neon
import { Pool } from "pg";
import 'dotenv/config'

//Define the global type for TypeScript
// Prevent the application from opening too many database connections during development
const globalForPrisma = global as unknown as {prisma:PrismaClient}
const pool= new Pool({connectionString:process.env.DATABASE_URL})
// initiale the adapter( if you are using NEON, use neon adapter)
const adapter= new PrismaPg(pool);

// initialise prisma
const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter, // Ensure 'adapter' is defined above this line
     log: process.env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error']
}).$extends(withAccelerate());

if(process.env.NODE_ENV !=="production") globalForPrisma.prisma=prisma;

const connectDB= async()=>{
    try {
        await prisma.$connect();
        console.log(`Database connected via prisma`);
    } catch (error:any) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1)
    }
}
const disconnectDB= async()=>{
    await prisma.$disconnect();
}

export{prisma, connectDB, disconnectDB};