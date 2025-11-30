const mongoose = require('mongoose'); // Import mongoose

const graphSchema = new mongoose.Schema({
    nodes: Object, // Store the graph as a JSON object
});

module.exports = mongoose.model('Graph', graphSchema);
