const expressAsyncHandler = require ("express-async-handler");
const User = require("../../model/user/User");
const crypto = require("crypto");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const generateToken = require("../../config/token/generateToken")
const validateMongodbId = require("../../utils/validatemongodbID")
const blockUser = require("../../utils/blocUser");
const cloudinaryUploadImg = require("../../utils/cloudinary");
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);


//-------------------------------
//REGISTER
//-------------------------------
const userRegisterController = expressAsyncHandler(async (req, res) => {
    
  //Check if user Exist
    const userExists = await User.findOne({ email: req?.body?.email });
    if (userExists) throw new Error("User already exists");
    try {
      //register user
const user = await User.create({
    firstName:req?.body?.firstName,
    lastName:req?.body?.lastName,
    Dni:req?.body?.Dni,
    genre:req?.body?.genre,
    numberPhone:req?.body?.numberPhone,
    email:req?.body?.email,
    bio:req?.body?.bio,
    password:req?.body?.password,
}); 
      res.json(user);
    } catch (error) {
      res.json(error);
    }
  });



//-------------------------------
//Login user
//-------------------------------

const loginUserController = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user exists
  const userFound = await User.findOne({ email });
  //check if blocked
  if (userFound?.isBlocked)
    throw new Error("Acceso denegado, su cuenta esta bloqueada, contacte a su administrador");
  if (userFound && (await userFound.isPasswordMatched(password))) {
    //Check if password is match
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      isProfessional:userFound?.isProfessional,
      token: generateToken(userFound?._id),
      isVerified: userFound?.isAccountVerified,
    });
  } else {
    res.status(401);
    throw new Error("Credenciales de Inicio de Sesión Inválidas");
  }
  
});


//------------------------------
//Users
//-------------------------------
const fetchUserController = expressAsyncHandler(async (req, res) => {
  console.log(req.headers);
  try {
    const users = await User.find({}).populate("jobs");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});


//------------------------------
//Delete user
//------------------------------
const deleteUserController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
    console.log("se ha  borrado el usuario")
  } catch (error) {
    res.json(error);
  }
});


//----------------
//user details
//----------------
const fetchUserDetailsController = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});


//------------------------------
//User profile
//------------------------------
const userProfileController = expressAsyncHandler(async (req, res) => {
  const {id} = req.params;
  validateMongodbId(id);
  //1.Find the login user
  //2. Check this particular if the login user exists in the array of viewedBy
  //Get the login user
  const loginUserId = req?.user?._id?.toString();
  try{
    const myprofile = await User.findById(id).populate("jobs").populate("viewedBy");
    console.log("my profile",myprofile)
    const alreadyViewed = myprofile?.viewedBy?.find(user => {
      console.log("el user profile ",user);
      return user?._id?.toString() === loginUserId;
    });
    if (alreadyViewed) {
      res.json(myprofile);
    } else {
      const profile = await User.findByIdAndUpdate(myprofile?._id, {
        $push: { viewedBy: loginUserId },
      });
      res.json(profile);
    }
  }catch(error){
    res.json(error);
  }
});


//------------------------------
//Update profile
//------------------------------
const updateUserController = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  //block
  //blockUser(req?.user);
  validateMongodbId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//------------------------------
//Update password
//------------------------------
const updateUserPasswordController = expressAsyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
});

//------------------------------
//following
//------------------------------
const followingUserController = expressAsyncHandler(async(req,res)=>{
  //1.Find the user you want to follow and update it's followers field
  //2. Update the login user following field
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the login id exist
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    user => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) throw new Error("You have already followed this user");

  //1. Find the user you want to follow and update it's followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  //2. Update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
});

//------------------------------
//unfollow
//------------------------------
const unfollowUserController = expressAsyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );

  res.json("You have successfully unfollowed this user");
});

//------------------------------
//Block User
//------------------------------
const blockUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isBlocked:true,
    },
    {new:true}
  );
  res.json(user);
});

//------------------------------
//Unblock User
//------------------------------
const unBlockUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isBlocked:false,
    },
    {new:true}
  );
  res.json(user);
});

//----------------------
//Confirm Professional User confirmar -> confirmProfessionalUserController --> confirmar profesional
//----------------------
const confirProfessionalUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isProfessional:true,
    },
    {new:true}
  );
  res.json(user);
});

//----------------------
//Cancel Professional User anular -> cancel -> cancelProfessionalUserController-->cancelar profesional
//----------------------
const cancelProfessionalUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isProfessional:false,
    },
    {new:true}
  );
  res.json(user);
});



//------------------------------
// Find Professional Users
//-------------------------------
const fetchProfessionalUserController = expressAsyncHandler(async (req, res) => {
  console.log(req.headers);
  try {
    const users = await User.find({isProfessional:true}).populate("jobs");
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//----------------------
//Confirm Admin User confirmar -> confirmProfessionalUserController --> confirmar profesional
//----------------------
const confirAdminUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isAdmin:true,
    },
    {new:true}
  );
  res.json(user);
});

//----------------------
//Cancel Admin User anular -> cancel -> cancelProfessionalUserController-->cancelar profesional
//----------------------
const cancelAdminUserController = expressAsyncHandler(async(req,res)=>{
  const {id}= req.params;
  validateMongodbId(id);

  const user = await  User.findByIdAndUpdate(
    id,
    {
      isAdmin:false,
    },
    {new:true}
  );
  res.json(user);
});

//------------------------------
// Generate Email verification token
//------------------------------
const generateVerificationTokenController = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user._id;
  const user = await User.findById(loginUserId);
  console.log("imprimiendo el user",user);

  try {
    //Generate token
    const verificationToken = await user?.createAccountVerificationToken();
    //save the user
    await user.save();
    console.log("token de verificacion",verificationToken);
    console.log("despues de guardar el token en la base de datos")
    //build your message
    const resetURL = `Si se le solicitó que verificara su cuenta, verifíquela ahora dentro de 10 minutos; de lo contrario, ignore este mensaje <a href="https://appserviprofbackend.onrender.com/verify-account/${verificationToken}">Click para verificar su Cuenta</a>`;
    console.log("despues de definir el url que se enviara al mail");
    const msg = {
      to: user?.email,
      //to:"alexandrasalgan@gmail.com",
      from:"alexandrasalgan@gmail.com" ,
      subject: "Verifica tu cuenta aquí",
      html: resetURL,
    };
    console.log("mensaje de  verificacion al mail",msg);

    await sgMail.send(msg);
    res.json(resetURL);
  } catch (error) {
    res.json(error);
  }
 
});

//------------------------------
//Account verification
//------------------------------
const accountVerificationController = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  //find this user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("Token expired, try again later");
  //update the proprt to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
  
});


//------------------------------
//Forget token generator
//------------------------------
const forgetPasswordTokenController = expressAsyncHandler(async(req,res)=>{
  //find the user by email
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User Not Found");

  try {
    //Create token
    const token = await user.createPasswordResetToken();
    console.log(token);
    await user.save();

    //build your message
    const resetURL = `Si se le solicitó que verificara su cuenta, verifíquela ahora dentro de 10 minutos; de lo contrario, ignore este mensaje<a href="https://appserviprofbackend.onrender.com/reset-password/${token}">Click para Resetear Contraseña</a>`;
    const msg = {
      to: email,
      from: "alexandrasalgan@gmail.com",
      subject: "Resetea tu contraseña ahora",
      html: resetURL,
    };

    await sgMail.send(msg);
    res.json({
      msg: `Un mensaje de verificación se envió con éxito a ${user?.email}. Restablecer ahora dentro de 10 minutos, ${resetURL}`,
    });
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Password reset
//------------------------------

const passwordResetController = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  //find this user by token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token caducado, inténtalo de nuevo más tarde");

  //Update/change the password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//------------------------------
//Profile Photo Upload
//------------------------------
const profilePhotoUploadController = expressAsyncHandler(async(req,res)=>{
  //Find the login user
  const { _id } = req.user;
  //block user
  /* blockUser(req?.user); */
  //1. Get the oath to img
  const localPath = `public/images/profile/${req.file.filename}`;
  //2.Upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);
  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );
  res.json(foundUser);
});


module.exports = { 
  userRegisterController,
  profilePhotoUploadController,
  loginUserController,
  fetchUserController,
  deleteUserController,
  fetchUserDetailsController,
  userProfileController,
  updateUserController,
  updateUserPasswordController,
  followingUserController,
  unfollowUserController,
  blockUserController,
  unBlockUserController,
  generateVerificationTokenController,
  accountVerificationController,
  forgetPasswordTokenController,
  passwordResetController,
  fetchProfessionalUserController,
  confirProfessionalUserController,
  cancelProfessionalUserController,
  confirAdminUserController,
  cancelAdminUserController
};


