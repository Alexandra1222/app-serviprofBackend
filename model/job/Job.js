const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"El nombre del trabajo es obligatorio"],
        trim: true,
    },
    budget:{
        type: String,
        required: [false,"El precio del trabajo es obligatorio"],
        trim: true,
    },
    //created by only category
    category:{
        type:String,
        required : [true,"La categoria es obligatoria"],
        default: "All",
    },
    isLiked: {
        type: Boolean,
        default: false,
    },
    isDisLiked: {
        type: Boolean,
        default: false,
    },
    numViews :{
        type: Number,
        default:0,
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },],
    disLikes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "por favor  el autor es obligatorio"],
    },
    description :{
        type:String,
        required:[true, "una pequeña descripcion es obligatoria"],
    },
    image:{
        type:String,
        default:"https://pixabay.com/es/illustrations/signo-de-interrogaci%c3%b3n-pregunta-1924516/",

    },
},
{    

toJSON:{
    virtuals:true,
},
toObject:{
    virtuals:true,
},
timestamps : true,

});

//populate comments
jobSchema.virtual("comments", {
    ref: "Comment",
    foreignField: "job",
    localField: "_id",
  });

//compile
const Job = mongoose.model('Job',jobSchema);
module.exports = Job;
