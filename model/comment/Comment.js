const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    job: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:[true,"El trabajo es requerido"],
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"El usuario es requerido"],
    },
    description:{
        type:String,
        required: [true,"La Descripción del comentario es requerida"],

    },


},
{ timestamps: true}
);

const Comment = mongoose.model('Comment',commentSchema);
module.exports = Comment;