// import dotenv from "dotenv";
// import connect_db from "./db/db.js";
// import app from "./app.js";
// import http from "http";
// const server = http.createServer();
// dotenv.config({
//   path: "./.env",
// });

// // because it returns a promise, we can use .then() to wait for the connection to be established and .catch() to handle any errors
// connect_db()
//   .then(() => {
//     server.on("request", app);
//     server.listen(process.env.PORT, () => {
//       console.log(`Server running on port number : ${process.env.PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Error connecting to the database: ", error);
//   });
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// console.log("Loaded PORT:", process.env.PORT);
import connect_db from "./db/db.js";
import app from "./app.js";
import http from "http";

const PORT = process.env.PORT;
const server = http.createServer(app);

connect_db()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database: ", error);
  });

// 🚀 Handle server shutdown properly
process.on("SIGTERM", () => {
  console.log("Gracefully shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("Server shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
