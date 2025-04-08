const mongoose = require("mongoose");

const connect = () => {
  mongoose.connect("mongodb://localhost:27017/MEP").then(()=>{
    console.log("database is connected");
  });
};


module.exports=connect;
