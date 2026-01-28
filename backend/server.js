//start server
require("dotenv").config({ path: "./backend/.env" });
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
