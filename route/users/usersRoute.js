const express = require('express');
const {userRegisterController, 
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
    profilePhotoUploadController,
    fetchProfessionalUserController,
    confirProfessionalUserController,
    cancelProfessionalUserController,
    confirAdminUserController,
    cancelAdminUserController} = require("../../controllers/users/usersController");
const userRoutes = express.Router();
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {photoUpload, profilePhotoResize } = require("../../middlewares/uploads/photoUpload");


userRoutes.post("/register", userRegisterController);
userRoutes.post("/login", loginUserController);
userRoutes.post("/generate-verify-email-token", authMiddleware,  generateVerificationTokenController );
userRoutes.put("/verifyaccount", authMiddleware, accountVerificationController);
userRoutes.put("/profilephotoUpload", authMiddleware, photoUpload.single("image"),profilePhotoResize,profilePhotoUploadController);
userRoutes.get("/",authMiddleware, fetchUserController);
userRoutes.get("/professional", fetchProfessionalUserController);
// Password reset
userRoutes.post("/forgetpasswordtoken",  forgetPasswordTokenController);
userRoutes.put("/resetpassword", passwordResetController);
userRoutes.put("/password", authMiddleware, updateUserPasswordController);
userRoutes.put("/follow", authMiddleware, followingUserController);
userRoutes.put("/unfollow", authMiddleware, unfollowUserController);
userRoutes.put("/blockuser/:id", authMiddleware, blockUserController);
userRoutes.put("/unblockuser/:id", authMiddleware, unBlockUserController);
userRoutes.put("/confirmProfessional/:id",authMiddleware,confirProfessionalUserController);
userRoutes.put("/cancelProfessional/:id",authMiddleware,cancelProfessionalUserController);
userRoutes.put("/confirmAdmin/:id",authMiddleware,confirAdminUserController);
userRoutes.put("/cancelAdmin/:id",authMiddleware,cancelAdminUserController);
userRoutes.get("/profile/:id", authMiddleware, userProfileController);
userRoutes.put("/:id", authMiddleware, updateUserController);
userRoutes.delete("/:id", deleteUserController);
userRoutes.get("/:id", fetchUserDetailsController);

module.exports = userRoutes;

