//Third party middleware
//CROSS ORIGIN RESOURCE SHARING
const allowedOrigins = require("./allowedOrigins");
const corsOptions = {
  //the following checks if the origin is part of the allowedOrigins.
  //NOTE || !origin below avoids blocking REST tools or server to server requests without origin like postman.
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
