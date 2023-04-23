const Job = require("../../model/job/Job");
const User = require("../../model/user/User");
const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../../utils/validatemongodbID");
const fs = require("fs");
const cloudinaryUploadImg = require("../../utils/cloudinary");
/* const blockUser = require("../../utils/blockUser"); */


//--------------------
// create job
//--------------------
const createJobController = expressAsyncHandler(async (req, res) => {
//console.log(req.file);
const {_id}= req.user;
//Display message if user is blocked
/* blockUser(req.user); */
/* validateMongodbId(req.body.user); */
//check for bar word
//1. Get the oath to img
const localPath = `public/images/jobs/${req.file.filename}`;
//2.Upload to cloudinary
const imgUploaded = await cloudinaryUploadImg(localPath);
try {
  const job = await Job.create({
    ...req.body,
    image:imgUploaded?.url,
    user:_id,
  });
  res.json(imgUploaded);
  //remove uploaded img
  //fs.unlinkSync(localPath);
} catch (error) {
  res.json(error);
}  
});




//------------------
// fecth all jobs
//api/jobs/?category=plomeria
//------------------
const fecthJobsController = expressAsyncHandler(async(req,res)=>{
  const hasCategory = req.query.category;
  try {
    //Check if it has a category
    if (hasCategory) {
      const jobs = await Job.find({ category: hasCategory })
        .populate("user")
        .populate("comments")
        .sort("-createdAt");

      res.json(jobs);
    } else {
      const jobs = await Job.find({})
        .populate("user")
        .populate("comments")
        .sort("-createdAt");
      res.json(jobs);
    }
  } catch (error) {
    res.json(error);
  }
});

//------------------
// fecth a single job
//------------------
const fetchJobController = expressAsyncHandler(async(req,res)=>{
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const job = await Job.findById(id)
      .populate("user")
      .populate("disLikes")
      .populate("likes")
      .populate("comments");
    //update number of views
    await Job.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(job);
  } catch (error) {
    res.json(error);
  }
  
});

//------------------
// update job
//------------------
const updateJobController = expressAsyncHandler(async(req,res)=>{
  const {id} = req.params;
  validateMongodbId(id);

  try{
    const job = await Job.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user:req.user?._id,

      },
      {
        new:true,
      });
      res.json(job);
  }catch(error){
    res.json(error);
  }
});

//------------------
// delete job
//------------------
const deleteJobController = expressAsyncHandler(async(req,res)=>{
  const {id}=req.params;
  validateMongodbId(id);
  try{
    const job = await Job.findOneAndDelete(id);
    res.json(job);
  } catch(error){
    res.json(error);
  }
});

//---------------
//likes
//----------------
const toggleAddLikesToJobsController = expressAsyncHandler(async(req,res)=>{
  const { jobId } = req.body;
  console.log("jobId",jobId)
  console.log("entrado al controlador de likes")
  //1.Find the job to be liked
  const job = await Job.findById(jobId);
  console.log("job",job)
  //2. Find the login user
  const loginUserId = req?.user?.id;
  //const loginUserId = '63dfbba4c15081041046457f'
  console.log("loginUserId",loginUserId);
  //3. Find is this user has liked this job?
  const isLiked = job?.isLiked;
  //4.Chech if this user has dislikes this job
  const alreadyDisliked = job?.disLikes?.find(
    userId => userId?.toString() === loginUserId?.toString()
  );
  //5.remove the user from dislikes array if exists
  if (alreadyDisliked) {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $pull: { disLikes: loginUserId },
        
      },
      { new: true }
    );
    res.json(job);
  }
  //Toggle
  //Remove the user if he has liked the job
  if (isLiked) {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $pull: { likes: loginUserId },
        
      },
      { new: true }
    );
    res.json(job);
  } else {
    //add to likes
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: { likes: loginUserId },
        
      },
      { new: true }
    );
    res.json(job);
  }
});


//---------------
//dislikes
//----------------
 const toggleAddDisLikesToJobsController = expressAsyncHandler( async (req,res)=>{
    //1. Find the job to be liked
  const { jobId } = req.body;
  let job = await Job.findById(jobId);
  console.log("job",job)
  //2. Find the login user
  const loginUserId = req?.user?.id;
  console.log("loginUserId",loginUserId);
  //3. Find if this user has liked this job
  const alreadyLiked = job?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  //4. Check if this user has disliked this job
  const isDisliked = job?.disLikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  //5. Remove the user from dislikes array if exists
  if (alreadyLiked) {
    job = await Job.findByIdAndUpdate(
      jobId,
      {
        $pull: { likes: loginUserId },
      },
      {
        new: true,
      }
    );
  }
 
  if (isDisliked) {
    job = await Job.findByIdAndUpdate(
      jobId,
      {
        $pull: { disLikes: loginUserId },
      },
      {
        new: true,
      }
    );
  } else {
    job = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: { disLikes: loginUserId },
      },
      {
        new: true,
      }
    );
  }
  res.json(job);
 });


module.exports = { createJobController,fecthJobsController,fetchJobController,toggleAddLikesToJobsController,toggleAddDisLikesToJobsController,updateJobController,deleteJobController };
