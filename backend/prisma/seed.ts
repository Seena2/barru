import {prisma} from './prisma.ts'

const authorId=  "cd7b4440-a3b3-4130-b61d-bb2843dc5447";
const articles= [
    {
        title:"Ten mistakes begginer developers make",
        abstract: " A guide for begginers...",
        fileUrl: "https://www.awstoragec3.com/article1.txt",
        fileType: "txt",
        articleType:["tech", "education"],
        pages: 54,
        submitedFor: "PROCEEDINGS",
        journalType: "ORIGINAL",
        notes: [],
         author: {
            connect: { id: authorId }, 
         },
    },
 {
  title: "Your Title",
  abstract: "Your Abstract",
  fileUrl: "...",
  fileType: "...",
  articleType: ["Research"],
  pages: 12,
  submitedFor: "PROCEEDINGS",
  journalType: "ORIGINAL",
  notes: [],
  author: {
            connect: { id: authorId }, 
         },
},
     {
        title:"Hikus adventure",
        abstract: " steps for good",
        fileUrl: "https://www.awstoragec3.com/article2.txt",
        fileType: "txt",
        articleType:["sport", "entertainmenet"],
        pages: 25,
        submitedFor: "JOURNAL",
        journalType: "ORIGINAL",
        notes: ["first submittion"],
         author: {
            connect: { id: authorId }, 
         },
    },
];

// seeding function
const main = async()=>{
    console.log("Seeding articles ....");
    for(const artic of articles){
        await prisma.article.create({ data:artic, })
        console.log(`Created article: ${artic.title}` );
    }
    console.log("Seeding completed...."); 
}

// run the seed function 
main().catch(async(error)=>{
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
}).finally(async()=>{await prisma.$disconnect();})

