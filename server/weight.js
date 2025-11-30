const express = require('express');
const mongoose = require('mongoose');
const { dijkstra, bellmanFord } = require('./dijkstra & bellmanford');
const router = express.Router();

const naukari = mongoose.model('naukari', new mongoose.Schema({
  companyName: String,
  popularity: Number,
  stipend: Number,
  openings: Number,
  skillsRequired: [String],
  updatedAt: { type: Date, default: Date.now }
}));

const graphSchema = new mongoose.Schema({
  nodes: Object, // Store the graph as a JSON object
});

const Graph = mongoose.model('Graph', graphSchema);

// Function to calculate the weight of a job
const calculateWeight = (naukari) => {
  return 1 / (naukari.popularity * 0.4 + naukari.stipend * 0.3 + naukari.openings * 0.3);
};

// Incrementally update the graph
const updateGraphWithJob = async (newJob) => {
  let graphDoc = await Graph.findOne({});
  let graph = graphDoc ? graphDoc.nodes : {};

  const weight = calculateWeight(newJob);

  // Add/Update nodes and edges for the new job's skills
  newJob.skillsRequired.forEach((skill, index) => {
    if (!graph[skill]) graph[skill] = [];

    newJob.skillsRequired.forEach((relatedSkill, i) => {
      if (i !== index) {
        // Add the edge between the skills
        const existingEdge = graph[skill].find(edge => edge.skill === relatedSkill);
        if (!existingEdge) {
          graph[skill].push({ skill: relatedSkill, naukariId: newJob._id, weight });
        }
      }
    });
  });

  // Update or insert the graph into the database
  await Graph.updateOne({}, { nodes: graph }, { upsert: true });
  return graph;
};

// API to add or update a job and update the graph incrementally
router.post('/add-job', async (req, res) => {
  const { companyName, popularity, stipend, openings, skillsRequired } = req.body;

  // Create or update the job in the naukari collection
  const newJob = await naukari.findOneAndUpdate(
    { companyName },
    { popularity, stipend, openings, skillsRequired, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  // Incrementally update the graph
  const updatedGraph = await updateGraphWithJob(newJob);

  res.json({ message: 'Job added/updated successfully!', newJob });
});

// API to get skill recommendations based on user's current skills
router.post('/recommend-skills', async (req, res) => {
  const { userSkills, graphType } = req.body;

  // Fetch the latest graph from DB
  const graphDoc = await Graph.findOne({});
  const graph = graphDoc ? graphDoc.nodes : {};

  // Determine whether to use Dijkstra or Bellman-Ford based on graph density
  let recommendedSkills;
  if (graphType === 'dense') {
    recommendedSkills = dijkstra(graph, userSkills);
  } else {
    recommendedSkills = bellmanFord(graph, userSkills);
  }

  // Filter and sort skills
  const filteredSkills = Object.entries(recommendedSkills)
    .filter(([skill]) => !userSkills.includes(skill))
    .sort((a, b) => a[1] - b[1]); // Sort by weight (ascending)

  const sortedRecommendedSkills = filteredSkills.map(([skill, weight]) => ({
    skill,
    weight
  }));
  console.log(graph);
  res.json({ recommendedSkills: sortedRecommendedSkills });
});

module.exports = router;