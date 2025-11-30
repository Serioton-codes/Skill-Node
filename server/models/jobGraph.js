const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for storing edges between skills
const EdgeSchema = new Schema({
  skill1: { type: String, required: true },
  skill2: { type: String, required: true },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  weight: { type: Number, required: true }
});

// Define schema for the JobGraph (contains edges between skills)
const JobGraphSchema = new Schema({
  edges: [EdgeSchema]
});

// Export model, ensuring it is only defined once
const JobGraph = mongoose.models.JobGraph || mongoose.model('JobGraph', JobGraphSchema);

module.exports = JobGraph;
