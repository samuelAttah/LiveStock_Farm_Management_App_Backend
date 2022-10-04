require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logEvents, logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConn");

//connect to MongoDB
connectDB();

//CUSTOM MIDDLEWARE LOGGER
app.use(logger);

//this handles credentials check before CORS
app.use(credentials);

app.use(cors(corsOptions));

//built in middleware to get form data from url
app.use(express.urlencoded({ extended: false }));

//built in middleware to read json files
app.use(express.json());

//third-party middleware for cookies. Note the cookie parser will help to parse refreshtoken in http-only cookies
app.use(cookieParser());

//built in middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/api/register"));
app.use("/auth", require("./routes/api/auth"));
app.use("/refresh", require("./routes/api/refresh"));
app.use("/logout", require("./routes/api/logout"));

app.use("/batches", verifyJWT, require("./routes/api/batches"));
app.use("/user", verifyJWT, require("./routes/api/user"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    //we set the content-type response header to text
    res.type("txt").send("404 Not Found");
  }
});

//this handles the CORS errors. It sends the error from the middlewares to the browser as just a single line(custom error)
app.use(errorHandler);

//we want to ensure mongoDB connection before listening to requests on our server so we can:

mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
