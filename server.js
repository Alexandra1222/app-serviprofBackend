const express = require("express");
const dotenv =require("dotenv");
const cors = require("cors");
dotenv.config();
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");
const jobRoute = require("./route/jobs/jobRoute");
const commentRoute = require("./route/comments/commentRoute");
const emailMsgRoute = require("./route/emailMsg/emailMsgRoute");
const categoryRoute = require("./route/category/categoryRoute");

const app = express();
//DB
dbConnect();
//middleware
app.use(express.json());
//use cors
app.use(cors());


app.use("/api/users",userRoutes);
//Job route
app.use("/api/jobs", jobRoute);
//comment route
app.use('/api/comments',commentRoute);
////email msg
app.use("/api/email", emailMsgRoute);
//category route
app.use("/api/category", categoryRoute);
app.use(errorHandler);
app.use(notFound);
//server
const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(` EL SERVIDOR ESTA CORRIENDO CORRECTAMENTE EN EL PUERTO ${PORT}`));