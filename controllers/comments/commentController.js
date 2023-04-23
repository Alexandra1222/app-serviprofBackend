const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../model/comment/Comment");
const Job = require("../../model/job/Job");
const validateMongodbID = require("../../utils/validatemongodbID");



//
//create
//
const createCommentController = expressAsyncHandler(async(req,res)=>{
    //get the user
    const user = req.user;
    //Check if user is blocked
  //blockUser(user);
    //get the job id
    const {jobId,description} = req.body;
    try{
        const comment = await Comment.create({
            job: jobId,
            user,
            description,
        })
        res.json(comment)
    }catch(error){
        res.json(error);
    }
});

//fetch all comments

const fetchAllCommentsController = expressAsyncHandler(async(req,res)=>{
    
    try{
        const comments = await Comment.find({}).sort('-created');
        res.json(comments)
    }catch(error){
        res.json(error);
    }
});

//fetch single comment  detail
const fetchCommentController = expressAsyncHandler(async (req,res)=>{
    const {id } = req.params;
    validateMongodbId(id);
    try{
        const comment = await Comment.findById(id);
        res.json(comment);
    }catch(error){
        res.json(error);
    }
});

//update comment controller
const updateCommentController = expressAsyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const update = await Comment.findByIdAndUpdate(id,{
            job:req.body?.jobId,
            user:req?.user,            
            description: req?.body?.description,
        },
        {
        new:true,
        runValidators:true,
        });
        res.json(update);
    }catch(error){

    }

});

//delete comment controller
const deleteCommentController = expressAsyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongodbID(id);
    try{
        const comment = await Comment.findByIdAndDelete(id);
        res.json(comment);
    }catch(error){
        res.json(error);
    }   
})

module.exports = {
    createCommentController,
    fetchAllCommentsController,
    fetchCommentController,
    updateCommentController,
    deleteCommentController
}