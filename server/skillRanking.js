const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const  Graph  = require("./models/graph2")
  

// Function to rank skills based on their node degree (number of connections)
const rankTrendingSkills = async () => {
  const graphDoc = await Graph.findOne({});
  if (!graphDoc || !graphDoc.nodes) {
    return [];
  }

  const graph = graphDoc.nodes;

  // Calculate degree of each skill (node)
  const skillDegree = {};
  for (const skill in graph) {
    skillDegree[skill] = graph[skill].length; // Degree = number of edges (connections)
  }

  // Sort skills by degree in descending order
  const trendingSkills = Object.entries(skillDegree)
    .sort((a, b) => b[1] - a[1]) // Sort by degree (descending)
    .map(([skill, degree]) => ({ skill, degree })); // Return skill with its degree

  return trendingSkills;
};

// API to get trending skills
router.get('/trending-skills', async (req, res) => {
  try {
    const trendingSkills = await rankTrendingSkills();
    res.json({ trendingSkills });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching trending skills.' });
  }
});

module.exports = router;
