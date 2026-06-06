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
@route: POST /users/
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
  } = req.body;
  //  Validate required fields
  if (
    !firstName ||
    !middleName ||
    !lastName ||
    !birthDate ||
    !gender ||
    !isMarried ||
    !nationality ||
    !telephone ||
    !city ||
    !country ||
    !isMember
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //check if user already has a profile, then instead of creating one update the existing
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    // return res.status(400) .json({ message: "Profile already exists for this user" });
    updateProfile(req, res);
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
@route: GET /users/:id
@access: Private
*/
const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from request object to check if use is authenticated
  const profileId = req.params.id as string; //used the query parameter instead of request body to target specific profile

  // check if user is exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // fetch the user profile associated with that userId and include their related profile:
  /* const userProfile = await prisma.user.findUnique({
  //   where: { id: profileId },
  //   include: { profile: true }, // Returns the Profile object or null if no profile exists for this user,
  // });
  or
  */
  const userProfile = await prisma.profile.findUnique({
    where: { id: profileId },
  });
  if (!userProfile) {
    return res.status(404).json({ message: "User profile not found" });
  }
  res.status(200).json(userProfile);
};
/*
@desc: Update user profile
@route: PUT /users/:id
@access: Private
*/
const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const profileId = req.params.id as string; //used the query parameter instead of request body to target specific profile
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
  } = req.body;
  //  Validate required fields
  if (
    !firstName ||
    !middleName ||
    !lastName ||
    !birthDate ||
    !gender ||
    !isMarried ||
    !nationality ||
    !telephone ||
    !city ||
    !country ||
    !isMember
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  //check if user profile data exists, if not create new using setProfile()
  const existingProfile = await prisma.profile.findUnique({
    where: { id: profileId },
  });
  if (!existingProfile) {
    // return res.status(400) .json({ message: "Profile not found, create new" });
    setProfile(req, res);
  }
  //verify the user is trying to update his own profile, except admin
  if (user?.role !== "ADMIN" || userId !== existingProfile?.userId) {
    return res.status(400).json({
      message: "Unauthorized, you are not allowed to update this profile",
    });
  }
  try {
    // Update existing user profile using update method
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        // <--- Note that update uses 'data' instead of 'update' unlike upsert w/c uses create
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        birthDate: birthDate,
        gender: gender,
        isMarried: isMarried,
        nationality: nationality,
        profileImage: profileImage,
        institution: institution,
        bio: bio,
        emails: emails,
        pobox: pobox,
        telephone: telephone,
      },
    });

    // alternatively, you can Use update to link an existing profile to an existing user (or create one if profile for the user doesn't exist):
    //update the profile using the update method and the upsert operator to either update the existing profile or create a new one if it doesn't exist:
    /*
    // update profile using using user table, hence user is related ot profile 
    // using update(), upsert & create together to update profile if it exists or create new if not,
    const updatedUserProfileOrCreateNew = await prisma.user.update({where: { id: userId },
        data: {
          profile: {
            upsert: {
              create: { firstName:firstName,middleName:middleName,lastName:lastName,birthDate:birthDate,gender:gender,
                  isMarried:isMarried,nationality:nationality,profileImage:profileImage,bio:bio,emails:emails,pobox:pobox,
                  telephone:telephone,institution:institution,city:city,country:country,isMember:isMember },
              update: { firstName:firstName,middleName:middleName,lastName:lastName,birthDate:birthDate,gender:gender,
                   isMarried:isMarried,nationality:nationality,profileImage:profileImage,bio:bio,emails:emails,pobox:pobox,
                   telephone:telephone,institution:institution,city:city,country:country,isMember:isMember},
            },
          },
        },
      });
    // OR using the profile table and upsert() method
    const updateUserProfileOrCraateNew=await prisma.profile.upsert({ where: {  id: yourId  },
      update: {
        firstName: firstName,  middleName: middleName, lastName: lastName, birthDate: birthDate, gender: gender,
        isMarried: isMarried,nationality: nationality, profileImage: profileImage,  bio: bio, emails: emails,
        pobox: pobox, telephone: telephone
      },
      create: { // <--- THIS IS WHAT PRISMA IS COMPLAINING IS MISSING
        id: userID, // ID might be required depending on your schema
         firstName: firstName,  middleName: middleName, lastName: lastName, birthDate: birthDate, gender: gender,
         isMarried: isMarried,nationality: nationality, profileImage: profileImage,  bio: bio, emails: emails,
         pobox: pobox, telephone: telephone
     }
});
*/
    res.status(200).json(updatedProfile);
    //  res.status(200).json(updateUserProfileOrCraateNew);
  } catch (error) {
    res.status(500).json({ message: "error updating profile" });
  }
};

/*
@desc: Delete user profile
@route: DELETE /users/:id
@access: Private
*/
const deleteProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  const profileId = req.params.id as string; //used the query parameter instead of request body to target specific profile
  // check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  //check if user profile data exists,
  const userProfile = await prisma.profile.findUnique({
    where: { id: profileId },
  });
  if (!userProfile) {
    return res.status(400).json({ message: "Profile not found" });
  }
  //verify the user have the right to delte
  if (user?.role !== "ADMIN" || userId !== userProfile?.userId) {
    return res.status(400).json({
      message: "Unauthorized, you are not allowed to delete this profile",
    });
  }
  await prisma.profile.delete({ where: { id: profileId } });
  res.status(201).json({ message: "User profile deleted successfully" });
};

// ADMIN ROUTES
/*
@desc: Get all users for admin purpose
@route: GET /users/
@access: Private
*/
const getAllUsers = async (req: Request, res: Response) => {
  const userId = req.user?.id; //get userId from auth middleware( w/c attached  user to request when the user is authenticated)
  // check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  //verify the user have the right to view user profiles
  if (user?.role !== "ADMIN") {
    return res
      .status(400)
      .json({
        message: "Unauthorized, you are not allowed to view users data",
      });
  }
  const users = await prisma.profile.findMany();
  res.status(200).json(users);
};

export { setProfile, getProfile, updateProfile, deleteProfile, getAllUsers };
