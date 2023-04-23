const express = require("express");
const { createJobController,fecthJobsController,fetchJobController,updateJobController,deleteJobController,toggleAddLikesToJobsController,toggleAddDisLikesToJobsController } = require("../../controllers/jobs/jobController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {photoUpload,jobPhotoResize} = require("../../middlewares/uploads/photoUpload")

const jobRoute = express.Router();

jobRoute.post("/", authMiddleware,photoUpload.single("image"),jobPhotoResize,  createJobController);
jobRoute.get("/", fecthJobsController);
jobRoute.get("/:id",fetchJobController);
jobRoute.put("/:id",authMiddleware,updateJobController);
jobRoute.delete("/:id",deleteJobController);
jobRoute.put("/jobsLike/likes" ,authMiddleware, toggleAddLikesToJobsController);
jobRoute.put("/jobsDislike/dislikes" ,authMiddleware, toggleAddDisLikesToJobsController);


module.exports = jobRoute;