const mongoose = require('mongoose');
const Graph1 = require('./models/graph'); // Update path as needed
const JobGraph = require('./models/jobGraph'); // Update path as needed
const dotenv = require('dotenv');
dotenv.config(); // This loads variables from .env into process.env

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    const graphData = await Graph1.find();
    console.log('Graph1 Data:', graphData);

    const jobGraphData = await JobGraph.find();
    console.log('JobGraph Data:', jobGraphData);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error querying data:', error);
  }
}

checkData();
