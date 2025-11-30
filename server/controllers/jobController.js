const express = require('express');
const mongoose = require('mongoose');
const Job = require("../models/job");
const Graph = require("../models/graph2");
const { addJobToGraph: updateTransitionGraph, deleteJobFromGraph: removeTransitionJobFromGraph } = require('../transition');
const { updateGraph: updateFreqHiredTogetherGraph, deleteJobFromJobGraph: removeFreqHiredTogetherJobFromGraph } = require('../frequently_hired_together');

// Helper functions for graph updates

// Calculate the weight of a job based on rating, salary, and maxPositions
const calculateWeight = (job) => {
  return 1 / (job.rating * 0.4 + job.salary * 0.3 + job.maxPositions * 0.3);
};

// Add/Update graph based on job data (transition and frequently hired together)
const updateGraphWithJob = async (job) => {
  let graphDoc = await Graph.findOne({});
  let graph = graphDoc ? graphDoc.nodes : {};

  const weight = calculateWeight(job);

  // Add/Update nodes and edges for the job's skills
  job.skillsets.forEach((skill, index) => {
    if (!graph[skill]) graph[skill] = [];

    job.skillsets.forEach((relatedSkill, i) => {
      if (i !== index) {
        const existingEdge = graph[skill].find(edge => edge.skill === relatedSkill);
        if (!existingEdge) {
          graph[skill].push({ skill: relatedSkill, jobId: job._id, weight });
        }
      }
    });
  });

  // Save updated graph
  await Graph.updateOne({}, { nodes: graph }, { upsert: true });
  console.log(job);
  // Call relevant functions from transition.js and frequently_hired_together.js
  await updateTransitionGraph(job._id, job.skillsets, job.pay || job.salary, job.maxPositions);
  await updateFreqHiredTogetherGraph(job._id, job.skillsets, job.pay || job.salary, job.maxPositions);
};

// Remove job from the graph (transition and frequently hired together)
const removeJobFromGraph = async (job) => {
  let graphDoc = await Graph.findOne({});
  let graph = graphDoc ? graphDoc.nodes : {};

  // Remove edges related to the job's skills
  job.skillsets.forEach(skill => {
    if (graph[skill]) {
      graph[skill] = graph[skill].filter(edge => edge.jobId.toString() !== job._id.toString());
    }
  });

  // Remove empty nodes
  Object.keys(graph).forEach(skill => {
    if (graph[skill].length === 0) {
      delete graph[skill];
    }
  });

  // Save updated graph
  await Graph.updateOne({}, { nodes: graph }, { upsert: true });

  // Call relevant functions from transition.js and frequently_hired_together.js
  await removeTransitionJobFromGraph(job._id);
  await removeFreqHiredTogetherJobFromGraph(job._id);
};

// Add job functionality with graph update
const addJob = (req, res) => {
  
  const user = req.user;
  console.log(req.user);
  if (user && user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to add jobs",
    });
    return;
  }

  const data = req.body;

  let job = new Job({
    userId: user._id,
    title: data.title,
    maxApplicants: data.maxApplicants,
    maxPositions: data.maxPositions,
    dateOfPosting: data.dateOfPosting,
    deadline: data.deadline,
    skillsets: data.skillsets,
    jobType: data.jobType,
    duration: data.duration,
    salary: data.salary,
    rating: data.rating,
  });

  job
    .save()
    .then(async (savedJob) => {
      // Update graph with new job
      console.log(savedJob);
      await updateGraphWithJob({
        _id: savedJob._id,
        rating: data.rating,
        salary: data.salary,
        maxPositions: data.maxPositions,
        skillsets: data.skillsets
      });
      console.log("here");
      res.status(201).json({ message: "Job added successfully to the database and graph updated" });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};

// Delete job functionality with graph update
const deleteJob = (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
    return;
  }

  Job.findOneAndDelete({
    _id: req.params.id,
    userId: user.id,
  })
    .then(async (job) => {
      if (!job) {
        res.status(401).json({
          message: "You don't have permissions to delete the job",
        });
        return;
      }

      // Update graph by removing the job
      await removeJobFromGraph(job);

      res.json({
        message: "Job deleted successfully and graph updated",
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

// Get a specific job
const getJob = (req, res) => {
  Job.findOne({ _id: req.params.id })
    .then((job) => {
      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      res.json(job);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

// Get all jobs with filtering and sorting
const getAllJob = (req, res) => {
  let user = req.user;
  let findParams = {};
  let sortParams = {};

  if (user.type === "recruiter" && req.query.myjobs) {
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.query.q, "i"),
      },
    };
  }

  if (req.query.jobType) {
    let jobTypes = Array.isArray(req.query.jobType) ? req.query.jobType : [req.query.jobType];
    findParams = {
      ...findParams,
      jobType: { $in: jobTypes },
    };
  }

  if (req.query.salaryMin || req.query.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        ...(req.query.salaryMin && { $gte: parseInt(req.query.salaryMin) }),
        ...(req.query.salaryMax && { $lte: parseInt(req.query.salaryMax) }),
      },
    };
  }

  if (req.query.duration) {
    findParams = {
      ...findParams,
      duration: { $lt: parseInt(req.query.duration) },
    };
  }

  if (req.query.asc) {
    sortParams = {
      ...sortParams,
      [req.query.asc]: 1,
    };
  }

  if (req.query.desc) {
    sortParams = {
      ...sortParams,
      [req.query.desc]: -1,
    };
  }

  let arr = [
    {
      $lookup: {
        from: "recruiterinfos",
        localField: "userId",
        foreignField: "userId",
        as: "recruiter",
      },
    },
    { $unwind: "$recruiter" },
    { $match: findParams },
    ...(Object.keys(sortParams).length > 0 ? [{ $sort: sortParams }] : []),
  ];

  Job.aggregate(arr)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      res.json(posts);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

// Update job functionality with graph update
const updateJob = (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to change the job details",
    });
    return;
  }

  Job.findOne({
    _id: req.params.id,
    userId: user.id,
  })
    .then(async (job) => {
      if (job == null) {
        res.status(404).json({
          message: "Job does not exist",
        });
        return;
      }

      const data = req.body;
      let oldJob = { ...job._doc };

      if (data.maxApplicants) job.maxApplicants = data.maxApplicants;
      if (data.maxPositions) job.maxPositions = data.maxPositions;
      if (data.deadline) job.deadline = data.deadline;
      if (data.skillsets) job.skillsets = data.skillsets;
      if (data.salary) job.salary = data.salary;
      if (data.rating) job.rating = data.rating;

      job
        .save()
        .then(async (updatedJob) => {
          // Remove old job's graph data and update with new job data
          await removeJobFromGraph(oldJob);
          await updateGraphWithJob({
            _id: updatedJob._id,
            rating: updatedJob.rating,
            salary: updatedJob.salary,
            maxPositions: updatedJob.maxPositions,
            skillsets: updatedJob.skillsets
          });

          res.json({ message: "Job updated successfully" });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};


module.exports = { updateJob, getAllJob, getJob, addJob, deleteJob };