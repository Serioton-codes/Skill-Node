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
  
  // Bellman-Ford Algorithm
  function bellmanFord(graph, startNodes) {
    const distances = {};
  
    startNodes.forEach(skill => {
      distances[skill] = 0;
    });
  
    for (let i = 0; i < Object.keys(graph).length - 1; i++) {
      for (const skill in graph) {
        graph[skill].forEach(neighbor => {
          const newDistance = distances[skill] + neighbor.weight;
          if (newDistance < (distances[neighbor.skill] || Infinity)) {
            distances[neighbor.skill] = newDistance;
          }
        });
      }
    }
  
    return distances;
  }
  
  module.exports = { dijkstra, bellmanFord };
  