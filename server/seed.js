const mongoose = require('mongoose');
const { Graph1 } = require('./models/graph'); // Adjust path if needed
const Job = require('./models/job'); // Ensure this path is correct
require('dotenv').config();

// Debug: Check MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI);

function calculateWeight(pay, openings) {
  const rawWeight = pay / (openings + 1);
  const minWeight = 0.01;
  const maxWeight = 0.99;
  const transformedWeight = Math.log1p(rawWeight) / Math.log1p(100 + rawWeight);
  return minWeight + (maxWeight - minWeight) * transformedWeight;
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Step 1: Seed jobs with a higher number of overlapping skillsets
    const sampleJobs = [
      // Non-bridge jobs with overlapping and non-overlapping skills
      {
        jobId: "J001",
        userId: new mongoose.Types.ObjectId(),
        title: "Full Stack Developer",
        pay: 80000,
        openings: 5,
        skillsets: ["JavaScript", "Node.js", "React", "MongoDB", "GraphQL"],
        companyName: "Tech Solutions",
      },
      {
        jobId: "J002",
        userId: new mongoose.Types.ObjectId(),
        title: "Data Scientist",
        pay: 90000,
        openings: 3,
        skillsets: ["Python", "Pandas", "Machine Learning", "SQL", "Statistics", "TensorFlow"],
        companyName: "Data Corp",
      },
      {
        jobId: "J003",
        userId: new mongoose.Types.ObjectId(),
        title: "Backend Engineer",
        pay: 85000,
        openings: 4,
        skillsets: ["Node.js", "Express", "MongoDB", "Docker", "Kubernetes"],
        companyName: "InfraWorks",
      },
      {
        jobId: "J004",
        userId: new mongoose.Types.ObjectId(),
        title: "AI Engineer",
        pay: 95000,
        openings: 2,
        skillsets: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras"],
        companyName: "AIMinds",
      },
      {
        jobId: "J005",
        userId: new mongoose.Types.ObjectId(),
        title: "DevOps Engineer",
        pay: 87000,
        openings: 3,
        skillsets: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Jenkins"],
        companyName: "CloudOps",
      },

      // Step 2: Add more 2-skill bridge jobs to connect clusters
      {
        jobId: "J006",
        userId: new mongoose.Types.ObjectId(),
        title: "Machine Learning Specialist",
        pay: 88000,
        openings: 3,
        skillsets: ["Python", "MongoDB"], // Bridge between Python and MongoDB clusters
        companyName: "DataOps",
      },
      {
        jobId: "J007",
        userId: new mongoose.Types.ObjectId(),
        title: "Backend Developer",
        pay: 87000,
        openings: 4,
        skillsets: ["Node.js", "SQL"], // Bridge between Node.js and SQL clusters
        companyName: "CodeLabs",
      },
      {
        jobId: "J008",
        userId: new mongoose.Types.ObjectId(),
        title: "Cloud Engineer",
        pay: 93000,
        openings: 2,
        skillsets: ["AWS", "Kubernetes"], // Bridge between AWS and Kubernetes clusters
        companyName: "CloudTech",
      },
      {
        jobId: "J009",
        userId: new mongoose.Types.ObjectId(),
        title: "Full Stack Engineer",
        pay: 90000,
        openings: 5,
        skillsets: ["JavaScript", "MongoDB"], // Bridge between JavaScript and MongoDB clusters
        companyName: "WebSolutions",
      },

      // Additional jobs to ensure clustering
      {
        jobId: "J010",
        userId: new mongoose.Types.ObjectId(),
        title: "Data Engineer",
        pay: 95000,
        openings: 3,
        skillsets: ["Python", "SQL", "Data Pipelines", "Hadoop"],
        companyName: "BigDataCo",
      },
      {
        jobId: "J011",
        userId: new mongoose.Types.ObjectId(),
        title: "Frontend Developer",
        pay: 80000,
        openings: 5,
        skillsets: ["JavaScript", "React", "HTML", "CSS"],
        companyName: "WebInnovators",
      },
      {
        jobId: "J012",
        userId: new mongoose.Types.ObjectId(),
        title: "Backend Developer",
        pay: 85000,
        openings: 3,
        skillsets: ["Java", "SQL", "Spring Boot"],
        companyName: "TechGiant",
      },
      {
        jobId: "J013",
        userId: new mongoose.Types.ObjectId(),
        title: "DevOps Specialist",
        pay: 90000,
        openings: 4,
        skillsets: ["AWS", "Docker", "CI/CD", "Jenkins"],
        companyName: "CloudTech",
      },
      {
        jobId: "J014",
        userId: new mongoose.Types.ObjectId(),
        title: "Full Stack Developer",
        pay: 85000,
        openings: 5,
        skillsets: ["JavaScript", "Node.js", "Express", "MongoDB", "Docker"],
        companyName: "MegaTech",
      },
      {
        jobId: "J015",
        userId: new mongoose.Types.ObjectId(),
        title: "Database Administrator",
        pay: 95000,
        openings: 2,
        skillsets: ["SQL", "Database Management", "Oracle", "MongoDB"],
        companyName: "DBCorp",
      }
    ];

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert sample jobs
    await Job.insertMany(sampleJobs);
    console.log('Inserted sample jobs');

    // Step 3: Build the graph edges from jobs
    const allJobs = await Job.find({});
    console.log(`Fetched ${allJobs.length} jobs`);

    const edges = [];

    allJobs.forEach(job => {
      const { skillsets, pay, openings } = job;
      for (let i = 0; i < skillsets.length; i++) {
        for (let j = i + 1; j < skillsets.length; j++) {
          const weight = calculateWeight(pay, openings);
          edges.push({
            skill1: skillsets[i],
            skill2: skillsets[j],
            weight,
          });
        }
      }
    });

    // Clear existing Graph1 for clean seeding
    await Graph1.deleteMany({});
    console.log('Cleared existing graph');

    // Insert new graph
    const graph = new Graph1({ edges });
    await graph.save();
    console.log('Populated Graph1 with edges from jobs');

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
