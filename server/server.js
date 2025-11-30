const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const passportConfig = require("./config/passportConfig");
const connectDB = require("./config/connectDB");
const { updateGraph, findFrequentlyHiredClusters } = require("./frequently_hired_together");
const { addJobToGraph, recommendSkillsWithCosts } = require("./transition");
const Job = require('./models/job');

dotenv.config();
connectDB();

//these lines basically created public folder and then profile and resume folder inside it.
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/resume")) {
  fs.mkdirSync("./public/resume");
}
if (!fs.existsSync("./public/profile")) {
  fs.mkdirSync("./public/profile");
}

const app = express();
const port = process.env.PORT || 4444;


// Setting up middlewares
app.use(cors());//allows frontend from different port to access my api's
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//this helps in accepting data coming in HTML form format 
//example name=Nites&age=23

// Setting up middlewares
app.use(passportConfig.initialize());

// POST route to handle /transition logic
app.post("/api/transition", async (req, res) => {
  try {
    const { knownSkills } = req.body;
    if (!knownSkills || !Array.isArray(knownSkills)) {
      return res.status(400).send('Known skills are required and must be an array');
    }

    const recommendations = await recommendSkillsWithCosts(knownSkills);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting transition recommendations:', error);
    res.status(500).send('Server error');
  }
});

// GET route to handle /frequent logic
app.get("/api/frequent", async (req, res) => {
  try {
    const { cutoff } = req.query;

    if (!cutoff) {
      return res.status(400).send('Cutoff is required');
    }

    const clusters = await findFrequentlyHiredClusters(parseInt(cutoff, 10));
    console.log("Heyooooooooooooo1",clusters);

    res.status(200).json(clusters);
  } catch (error) {
    console.error('Error getting frequently hired clusters:', error);
    res.status(500).send('Server error');
  }
});


// Routing
app.use("/auth", require("./routes/authRoutes"));

app.use("/api", [
  require("./routes/jobsRoutes"),
  require("./routes/ratingRoutes"),
  require("./routes/userRoutes"),
  require("./routes/jobApplicationRoutes"),
  require("./recommendedSkills"),//important
  require("./skillRanking")
]);
app.use("/upload", require("./routes/uploadRoutes"));
app.use("/host", require("./routes/downloadRoutes"));


app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
