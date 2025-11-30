// Dijkstra Algorithm
function dijkstra(graph, startNodes) {
    const distances = {};
    const priorityQueue = [];
  
    startNodes.forEach(skill => {
      distances[skill] = 0;
      priorityQueue.push({ skill, weight: 0 });
    });
  
    while (priorityQueue.length) {
      const current = priorityQueue.pop();
      const { skill, weight } = current;
  
      if (graph[skill]) {
        graph[skill].forEach(neighbor => {
          const newDistance = weight + neighbor.weight;
          if (newDistance < (distances[neighbor.skill] || Infinity)) {
            distances[neighbor.skill] = newDistance;
            priorityQueue.push({ skill: neighbor.skill, weight: newDistance });
          }
        });
      }
    }
    return distances;
  }
  
  // Floyd-Warshall algorithm
  function floydWarshall(graph, startNodes) {
    // Initialize distance matrix
    const nodes = Object.keys(graph);
    const distances = {};
    const INF = Infinity;
  
    // Initialize distances
    nodes.forEach(node => {
      distances[node] = {};
      nodes.forEach(otherNode => {
        distances[node][otherNode] = node === otherNode ? 0 : INF;
      });
    });
  
    // Set initial distances from the graph
    for (const node in graph) {
      graph[node].forEach(neighbor => {
        distances[node][neighbor.skill] = neighbor.weight;
      });
    }
  
    // Floyd-Warshall algorithm
    nodes.forEach(k => {
      nodes.forEach(i => {
        nodes.forEach(j => {
          if (distances[i][j] > distances[i][k] + distances[k][j]) {
            distances[i][j] = distances[i][k] + distances[k][j];
          }
        });
      });
    });
  
    // Get shortest distances from start nodes
    const result = {};
    startNodes.forEach(startNode => {
      result[startNode] = {};
      nodes.forEach(node => {
        result[startNode][node] = distances[startNode][node];
      });
    });
  
    return result;
  }
  
  
  module.exports = { dijkstra, floydWarshall };
  