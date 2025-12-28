const express = require("express");
const cors = require("cors");

const childrenRoutes = require("./routes/children");
const eventsRoutes = require("./routes/events");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes
app.use("/children", childrenRoutes);
app.use("/events", eventsRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
