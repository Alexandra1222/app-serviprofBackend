const express = require("express");
const {deleteCommentController,updateCommentController,fetchCommentController,fetchAllCommentsController,createCommentController} = require("../../controllers/comments/commentController")
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const commentRoute = express.Router();


commentRoute.post("/",authMiddleware, createCommentController);
commentRoute.get("/",authMiddleware,fetchAllCommentsController );
commentRoute.get("/:id",authMiddleware,fetchCommentController );
commentRoute.put("/:id",authMiddleware,updateCommentController );
commentRoute.delete("/:id",authMiddleware, deleteCommentController );





module.exports = commentRoute;
