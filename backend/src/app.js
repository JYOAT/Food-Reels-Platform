//create server
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const foodRoute = require("./routes/food.routes");
const foodPartnerRoutes = require("./routes/food-partner.routes");
const cors = require("cors");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to Zomato API");
});

app.use("/api/auth", authRoute);
app.use("/api/food", foodRoute);
app.use("/api/food-partner", foodPartnerRoutes);
module.exports = app;
