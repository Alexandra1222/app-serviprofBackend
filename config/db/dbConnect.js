const mongoose = require("mongoose");
const dotenv =require("dotenv");

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL,
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    console.log("LA BASE DE DATOS ESTA CONECTADA");
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
};

module.exports = dbConnect;