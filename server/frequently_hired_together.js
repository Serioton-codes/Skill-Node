const mongoose = require("mongoose");
const {Graph1} = require("./models/graph"); // Update path as needed
const JobGraph = require("./models/jobGraph"); // Update path as needed
const Job = require("./models/job");

// Function to add a job to the weighted graph
async function addJobToGraph(jobId, skills, pay, openings) {
  let graph = await Graph1.findOne();
  
  if (!graph) {
    graph = new Graph1();
  }
  

  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      // Define the weight as some function of pay and openings
      const weight = calculateWeight(pay, openings);

      let edge = graph.edges.find(
        e => (e.skill1 === skills[i] && e.skill2 === skills[j]) || (e.skill1 === skills[j] && e.skill2 === skills[i])
      );

      if (!edge) {
        edge = { skill1: skills[i], skill2: skills[j], weight };
        graph.edges.push(edge);
      } else {
        edge.weight = Math.max(edge.weight, weight); // Update weight if necessary
      }
    }
  }

  await graph.save();
  // console.log(graph);
}

// Helper function to calculate weight based on job attributes
function calculateWeight(pay, openings) {
  // Example weight calculation, adjust as needed
  return Math.log1p(pay) * Math.log1p(openings);
}

// Function to add an edge between two skills
async function addEdgeToJobGraph(skill1, skill2, jobId) {
  const jobGraph = await JobGraph.findOne() || new JobGraph();

  let edge = jobGraph.edges.find(
    e => (e.skill1 === skill1 && e.skill2 === skill2) || (e.skill1 === skill2 && e.skill2 === skill1)
  );

  if (!edge) {
    edge = { skill1, skill2, jobs: [jobId], weight: 1 };
    jobGraph.edges.push(edge);
  } else {
    edge.jobs.push(jobId);
    edge.weight += 1;
  }

  await jobGraph.save();
}

// Function to build the job graph from a list of jobs
async function buildJobGraph(jobs) {
  for (const job of jobs) {
    const jobId = job._id;
    const skills = job.skills;

    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        await addEdgeToJobGraph(skills[i], skills[j], jobId);
      }
    }
  }
}

async function findFrequentlyHiredClusters(cutoff) {
  // Fetch all jobs from the database

  const jobs = await Job.find(); 
  
  // Dynamically build the job graph based on jobs data
  const jobGraph = { edges: [] };

  for (const job of jobs) {
    console.log("JOB IS : " ,job);
    const jobId = job._id;
    const skills = job.skillsets;

    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const edge = jobGraph.edges.find(
          e => (e.skill1 === skills[i] && e.skill2 === skills[j]) || (e.skill1 === skills[j] && e.skill2 === skills[i])
        );
        if (!edge) {
          jobGraph.edges.push({ skill1: skills[i], skill2: skills[j], jobs: [jobId], weight: 1 });
        } else {
          edge.jobs.push(jobId);
        }
      }
    }
  }

  // Perform DFS to find connected components
  const visited = new Set();
  const clusters = [];

  for (const edge of jobGraph.edges) {
    if (!visited.has(edge.skill1)) {
      const component = await dfs(jobGraph, edge.skill1, visited, cutoff);
      if (component.size > 1) {
        clusters.push(Array.from(component));
      }
    }
  }
  console.log("Heyo00000000000000000",clusters);
  return clusters;
}
// Helper function for DFS
async function dfs(jobGraph, skill, visited, cutoff) {
  const stack = [skill];
  const component = new Set();

  while (stack.length > 0) {
    const node = stack.pop();
    if (!visited.has(node)) {
      visited.add(node);
      component.add(node);

      // Get neighbors, i.e., edges where the node is connected to another skill
      const neighbors = jobGraph.edges.filter(
        e => (e.skill1 === node || e.skill2 === node) && e.jobs.length >= cutoff
      );

      // Debugging: Log neighbors being processed
      console.log(`Processing skill: ${node}`);
      console.log(`Neighbors: ${neighbors.map(neighbor => `${neighbor.skill1} <-> ${neighbor.skill2}`)}`);
      
      // Traverse neighbors
      for (const neighbor of neighbors) {
        const nextSkill = neighbor.skill1 === node ? neighbor.skill2 : neighbor.skill1;
        if (!visited.has(nextSkill)) {
          stack.push(nextSkill);
        }
      }
    }
  }

  // Return the component as an array for clustering
  return component;
}

async function removeEdgesFromJobGraph(skills, jobId) {
  const jobGraph = await JobGraph.findOne();
  if (!jobGraph) return;

  // Filter out edges that correspond to the given job and skills
  jobGraph.edges = jobGraph.edges.filter(edge => {
    const isInSkillset = (skills.includes(edge.skill1) && skills.includes(edge.skill2));
    if (isInSkillset) {
      edge.jobs = edge.jobs.filter(id => id.toString() !== jobId.toString());
      return edge.jobs.length > 0; // Keep edge only if there are other jobs using it
    }
    return true;
  });

  await jobGraph.save();
}

// Function to delete a job and remove associated edges from JobGraph
async function deleteJobFromJobGraph(jobId) {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const { skills } = job;

  // Remove edges from the job graph corresponding to this job's skills
  await removeEdgesFromJobGraph(skills, jobId);

  // Delete the job from the Job collection
  await Job.findByIdAndDelete(jobId);
}


// Function to update both graphs when a new job is added
async function updateGraph(jobId, skills, pay, openings) {
  await addJobToGraph(jobId, skills, pay, openings); // Update the weighted graph
  await buildJobGraph([ { _id: jobId, skills } ]); // Update the JobGraph with frequently hired skills
}

module.exports = { updateGraph, addEdgeToJobGraph, buildJobGraph, findFrequentlyHiredClusters,deleteJobFromJobGraph  };
