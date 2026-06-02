import type { Request, Response } from "express";
import { prisma } from "../config/prisma.ts";

/*
@desc: create user and profile at the same time
@route: POST /users/
@access: Public
*/
/*
// Use the create method to build both the user and their related profile at the same time:
    const newUser = await prisma.user.create({
      data: {
        email: "alice@example.com",
        profile: {
          create: {
            bio: "Hello, I love coding!",
          },
        },
      },
    });
*/
/*
@desc: set user profile
@route: POST /users/<userId>/profile
@access: Private
*/
const setProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const {
    firstName,
    middleName,
    lastName,
    birthDate,
    gender,
    isMarried,
    nationality,
    profileImage,
    bio,
    emails,
    pobox,
    telephone,
    institution,
    city,
    country,
    isMember,
    role,
  } = req.body;
  //  Validate required fields
  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !emails ||
    !pobox ||
    !telephone ||
    !institution ||
    !city ||
    !country
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  //check if user already has a profile
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    return res
      .status(400)
      .json({ message: "Profile already exists for this user" });
  }

  try {
    //create a profile for that user by connecting it to their userId in the database.
    const profile = await prisma.profile.create({
      data: {
        firstName,
        middleName,
        lastName,
        birthDate,
        gender,
        isMarried,
        nationality,
        profileImage,
        bio,
        emails,
        pobox,
        telephone,
        institution,
        city,
        country,
        isMember,
        role,
        user: { connect: { id: userId } }, //connects the profile to the existing user by their userId, this assumes that the user is already authenticated and we have their userId available from the auth middleware
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating profile" });
  }
};

/*
@desc: Get user profile
@route: GET api/users/userId
@access: Private
*/
const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from request object to check if use is authenticated
  // fetch the profile associated with that userId and include their related profile:
  const userWithProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // Returns the Profile object or null if no profile exists for this user},
  });
  if (!userWithProfile) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(userWithProfile);
};
/*
@desc: Update user profile
@route: PUT api/users/userId
@access: Private
*/
const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from request object
  const {
    firstName,
    middleName,
    lastName,
    birthDate,
    gender,
    isMarried,
    nationality,
    profileImage,
    bio,
    emails,
    pobox,
    telephone,
    institution,
    city,
    country,
    isMember,
    role,
  } = req.body;
  //  Validate required fields
  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !emails ||
    !pobox ||
    !telephone ||
    !institution ||
    !city ||
    !country
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // check if user exists and has a profile and fetch the profile associated with the userId
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }, // Returns the Profile object or null if no profile exists for this user},
  });
  if (!userProfile) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    // Update existing user profile using update method
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        // <--- Note that update uses 'data' instead of 'update' unlike upsert
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        birthDate: birthDate,
        gender: gender,
        isMarried: isMarried,
        nationality: nationality,
        profileImage: profileImage,
        bio: bio,
        emails: emails,
        pobox: pobox,
        telephone: telephone,
        role: role,
      },
    });

    // alternatively, you can Use update to link an existing profile to an existing user (or create one if profile for the user doesn't exist):
    //update the profile using the update method and the upsert operator to either update the existing profile or create a new one if it doesn't exist:
    /*
    // update profile using using user table or create new, hence user is related ot profile 
    const updatedUserProfileOrCreateNew = await prisma.user.update({where: { id: userId },
        data: {
          profile: {
            upsert: {
              create: { firstName:firstName,middleName:middleName,lastName:lastName,birthDate:birthDate,gender:gender,
                  isMarried:isMarried,nationality:nationality,profileImage:profileImage,bio:bio,emails:emails,pobox:pobox,
                  telephone:telephone,institution:institution,city:city,country:country,isMember:isMember,role:role, },
              update: { firstName:firstName,middleName:middleName,lastName:lastName,birthDate:birthDate,gender:gender,
                   isMarried:isMarried,nationality:nationality,profileImage:profileImage,bio:bio,emails:emails,pobox:pobox,
                   telephone:telephone,institution:institution,city:city,country:country,isMember:isMember,role:role,},
            },
          },
        },
      });
    // OR using the profile table
    const updateUserProfileOrCraateNew=await prisma.profile.upsert({ where: {  id: yourId  },
      update: {
        firstName: firstName,  middleName: middleName, lastName: lastName, birthDate: birthDate, gender: gender,
        isMarried: isMarried,nationality: nationality, profileImage: profileImage,  bio: bio, emails: emails,
        pobox: pobox, telephone: telephone, role: role,
      },
      create: { // <--- THIS IS WHAT PRISMA IS COMPLAINING IS MISSING
        id: userID, // ID might be required depending on your schema
         firstName: firstName,  middleName: middleName, lastName: lastName, birthDate: birthDate, gender: gender,
         isMarried: isMarried,nationality: nationality, profileImage: profileImage,  bio: bio, emails: emails,
         pobox: pobox, telephone: telephone, role: role,
     }
});
*/
    res.status(200).json(updatedProfile);
    //  res.status(200).json(updateUserProfileOrCraateNew);
  } catch (error) {}
};

/*
@desc: Delete user profile
@route: DELETE api/users/<userId>/profile
@access: Private
*/
const deleteProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userProfile = await prisma.profile.findUnique({
    where: { id: userId },
  });
  if (!userProfile) {
    return res.status(404).json({ error: "User not found" });
  }
  await prisma.profile.delete({ where: { id: userId } });
  res.status(201).json({ message: "User profile deleleted successfully" });
};

// ADMIN ROUTES
/*
@desc: Get all users
@route: GET api/users
@access: Private
*/
const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
};

export { setProfile, getProfile, updateProfile, deleteProfile, getAllUsers };
