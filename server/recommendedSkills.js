const express = require('express');
const mongoose = require('mongoose');
const { dijkstra, floydWarshall } = require("./dijkstra & floydwarshall"); // Ensure you have this module with appropriate functions
const router = express.Router();
const job = require("./models/job");
const Graph = require("./models/graph2");

// Function to choose between Dijkstra and Floyd-Warshall
function chooseAlgorithm(nodes) {
  const numNodes = Object.keys(nodes).length;
  const numEdges = Object.values(nodes).reduce((acc, edges) => acc + Object.keys(edges).length, 0);

  // Time complexity considerations
  // Dijkstra: O((E + V) log V)
  // Floyd-Warshall: O(V^3)
  if (numNodes === 0) {
    throw new Error('The graph contains no nodes. Cannot determine the algorithm.');
  }
  // Calculate the threshold for using Floyd-Warshall
  const threshold = (numNodes ** 3) / Math.log(numNodes);

  // Choose algorithm based on the number of edges
  if (numEdges > threshold) {
    return 'floydWarshall'; // Use Floyd-Warshall if edges exceed the threshold
  } else {
    return 'dijkstra'; // Use Dijkstra otherwise
  }
}

// API to get skill recommendations based on user's current skills
router.post('/recommend-skills', async (req, res) => {
  const { userSkills } = req.body;

  // Fetch the latest graph from DB
  // console.log(Graph);
  const graphDoc = await Graph.findOne({});
  const graph = graphDoc ? graphDoc.nodes : {};

  // Determine which algorithm to use
  const algorithm = chooseAlgorithm(graph);
  
  let recommendedSkills;
  if (algorithm === 'dijkstra') {
    console.log(userSkills);
    recommendedSkills = dijkstra(graph, userSkills);
  } else {
    recommendedSkills = floydWarshall(graph, userSkills);
  }

  // Filter and sort skills
  const filteredSkills = Object.entries(recommendedSkills)
    .filter(([skill]) => !userSkills.includes(skill))
    .sort((a, b) => a[1] - b[1]); // Sort by weight (ascending)

  const sortedRecommendedSkills = filteredSkills.map(([skill, weight]) => ({
    skill,
    weight
  }));

  // console.log(graph);
  res.json({ recommendedSkills: sortedRecommendedSkills });
});

module.exports = router;
