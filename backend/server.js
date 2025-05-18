const cors = require("cors");
const express = require("express");
const connect = require("./db/Database");
const router = require("./control/user");
const shop = require("./control/shop");
const order=require("./control/order")
const cookie = require("cookie-parser");
const product = require("./control/product");
const payment = require("./control/payment");
const event = require("./control/Event");
const cloudinary=require("cloudinary")
const message=require("./control/Message")
const conversation=require("./control/Conversation")
const app = express();
const port = 5000;

app.use(express.json({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:8081","https://297c-213-55-102-49.ngrok-free.app"],
    // origin: "*",
    credentials: true,
  })
);

app.use(cookie());
connect();

cloudinary.config({
  cloud_name:"dll1pjjbm",
  api_key:"436377263181225",
  api_secret:"y53nJ5-e01HR93f2CmcFHKO3lb4"
})


app.use("/order",order)
app.use("/event",order)
app.use("/payment", payment);
app.use("/message", message);
app.use("/conversation", conversation);
app.use("/product", product);
app.use("/user", router);
app.use("/shop", shop);


// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  process.exit(1);
});


// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  server.close(() => {
    process.exit(1);
  });
});

app.use((err, req, res, next) => {
  const message = err.message;
  const status = err.status || 500;

  res.status(status).json({
    message: message,
    status: status,
  });
});

const server =app.listen(port, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});
