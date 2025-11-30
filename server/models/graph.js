const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for Graph with additional weighted edges
const WeightedEdgeSchema = new Schema({
  skill1: { type: String },
  skill2: { type: String },
  weight: { type: Number }
});

const GraphSchema = new Schema({
  edges: [WeightedEdgeSchema]
});

// Export model, ensuring it is only defined once
//it creates the graph once in the mongoDB databse and then use it multiple times. 
//addition of jobs and removal of jobs changes the contents of database only. 
//dummy jobs will be there always

const Graph1 = mongoose.models.Graph1 || mongoose.model('Graph1', GraphSchema);

module.exports ={Graph1};
