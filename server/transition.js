const mongoose = require("mongoose");
const {Graph1} = require("./models/graph");
const Job = require("./models/job"); // Assuming you have a Job model for the jobs collection

// Function to calculate the weight between skills
function calculateWeight(pay, openings) {
  const rawWeight = pay / (openings + 1);
  const minWeight = 0.01;
  const maxWeight = 0.99;
  const transformedWeight = Math.log1p(rawWeight) / Math.log1p(100 + rawWeight);
  return minWeight + (maxWeight - minWeight) * transformedWeight;
}

// Function to add an edge between two skills in the graph
async function addEdgeToGraph(skill1, skill2, pay, openings) {
  const graph = await Graph1.findOne() || new Graph1();
  const weight = calculateWeight(pay, openings);
  // console.log(graph);

  let edge = graph.edges.find(
    e => (e.skill1 === skill1 && e.skill2 === skill2) || (e.skill1 === skill2 && e.skill2 === skill1)
  );

  if (!edge) {
     edge = { skill1, skill2, weight };
    graph.edges.push(edge);
  } else {
    // console.log(edge);
    edge.weight = weight; // Update the weight
  }

  await graph.save();
}

// Function to add a job and update the graph with edges
async function addJobToGraph(jobId, requiredSkills, pay, openings) {
  for (let i = 0; i < requiredSkills.length; i++) {
    for (let j = i + 1; j < requiredSkills.length; j++) {
      await addEdgeToGraph(requiredSkills[i], requiredSkills[j], pay, openings);
    }
  }
}

// Helper function for Bellman-Ford algorithm
// Helper function for Bellman-Ford algorithm to compute all-pairs shortest paths
function bellmanFordAllPairs(graph) {
    const skills = new Set(graph.edges.flatMap(e => [e.skill1, e.skill2]));
    const skillArray = Array.from(skills);
    const numSkills = skillArray.length;
  
    // Initialize distance matrix
    const distanceMatrix = Array(numSkills).fill(null).map(() => Array(numSkills).fill(Infinity));
    
    skillArray.forEach((skill, i) => {
      distanceMatrix[i][i] = 0; // Distance from a skill to itself is 0
    });
  
    // Fill in the initial distances from edges
    graph.edges.forEach(({ skill1, skill2, weight }) => {
      const i = skillArray.indexOf(skill1);
      const j = skillArray.indexOf(skill2);
      distanceMatrix[i][j] = weight;
      distanceMatrix[j][i] = weight; // Assuming undirected graph
    });
  
    // Bellman-Ford relaxation
    for (let k = 0; k < numSkills - 1; k++) {
      for (let i = 0; i < numSkills; i++) {
        for (let j = 0; j < numSkills; j++) {
          for (let l = 0; l < numSkills; l++) {
            if (distanceMatrix[i][l] < Infinity && distanceMatrix[l][j] < Infinity) {
              distanceMatrix[i][j] = Math.min(distanceMatrix[i][j], distanceMatrix[i][l] + distanceMatrix[l][j]);
            }
          }
        }
      }
    }
  
    return { distanceMatrix, skillArray };
  }
  


// Function to remove edges between skills in Graph1 based on the job's skills
async function removeEdgesFromGraph(requiredSkills) {
  const graph = await Graph1.findOne();
  if (!graph) return;

  // Iterate over pairs of skills and remove corresponding edges
  for (let i = 0; i < requiredSkills.length; i++) {
    for (let j = i + 1; j < requiredSkills.length; j++) {
      graph.edges = graph.edges.filter(
        e => !(e.skill1 === requiredSkills[i] && e.skill2 === requiredSkills[j]) &&
             !(e.skill1 === requiredSkills[j] && e.skill2 === requiredSkills[i])
      );
    }
  }

  await graph.save();
}

// Function to delete a job and remove associated edges from Graph1
async function deleteJobFromGraph(jobId) {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const { skillsets: requiredSkills } = job;

  // Remove edges from the graph corresponding to this job's skills
  await removeEdgesFromGraph(requiredSkills);

  // Delete the job from the Job collection
  await Job.findByIdAndDelete(jobId);
}

// Function to recommend jobs based on known skills
// Function to recommend jobs based on known skills
async function recommendSkillsWithCosts(knownSkills) {
    const graph = await Graph1.findOne(); // Fetch the graph from the database
    console.log(graph);
    if (!graph) return []; // Handle case if the graph is empty
  
    const { distanceMatrix, skillArray } = bellmanFordAllPairs(graph); // Call Bellman-Ford with the graph
  
    const knownSet = new Set(knownSkills);
  
    // Fetch all jobs from the database
    const jobs = await Job.find(); // Assuming you have a Job model and collection
  
    // Array to store job recommendations with their total distances and required skills
    const recommendations = [];
  
    jobs.forEach(job => {
      const { jobId, skillsets } = job;
      const requiredSkills = skillsets;
      const additionalSkills = requiredSkills.filter(skill => !knownSet.has(skill)); // Skills user needs to learn
  
      // Calculate the sum of the shortest distances from the closest known skill
      let totalDistance = 0;
      const skillsDistances = {};
  
      additionalSkills.forEach(skill => {
        const skillIndex = skillArray.indexOf(skill);
        const closestKnownSkillDistance = Math.min(
          ...knownSkills.map(knownSkill => {
            const knownSkillIndex = skillArray.indexOf(knownSkill);
            return distanceMatrix[knownSkillIndex][skillIndex] || Infinity;
          })
        );
  
        totalDistance += closestKnownSkillDistance; // Sum the distances
        skillsDistances[skill] = closestKnownSkillDistance; // Store distances for debugging
      });
  
      recommendations.push({
        jobId, 
        totalDistance, 
        requiredSkills, 
        skillsDistances // Include distances for each required skill
      });
    });
  
    // Sort recommendations by total distance in increasing order
    recommendations.sort((a, b) => a.totalDistance - b.totalDistance);
  
    // Debugging output for the recommendations and graph structure
    console.log('Recommendations:', recommendations);
    console.log('Graph Structure:', graph);
  
    return recommendations; // Return sorted recommendations
  }
  
  module.exports = { addJobToGraph, recommendSkillsWithCosts, deleteJobFromGraph };
