const allowedOrigins = [
  // "https://www.yoursite.com",
  // "http://127.0.0.1:5500",
  // "http://localhost:3500",
  process.env.BASE_URL,
];

module.exports = allowedOrigins;
