// src/FrequentSkillsPage.js
import React, { useState, useEffect } from 'react';
import './Frequent.css'; // Import the CSS file for styling
import apiList from "../modules/apiList"

const FrequentSkillsPage = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cutoff, setCutoff] = useState(3); // Default cutoff value
  const [inputCutoff, setInputCutoff] = useState(cutoff);

  useEffect(() => {
    // Function to fetch data from the API with the current cutoff value
    const fetchClusters = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiList.server}/api/frequent?cutoff=${cutoff}`);
        const data = await response.json();
        setClusters(data);
      } catch (error) {
        console.error('Error fetching clusters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [cutoff]); // Fetch data when cutoff value changes

  const handleSubmit = (e) => {
    e.preventDefault();
    setCutoff(inputCutoff); // Update the cutoff value to fetch new data
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize:"3.6rem",color: 'green' ,marginBottom:"0"}}>Frequently Hired Together</h1>
      <p>Enter a job occurrence threshold and get skills that got hired together.</p>
      <form onSubmit={handleSubmit} className="cutoff-form">
        <label style={{fontWeight:"700"}} htmlFor="cutoff">Enter job occurrence threshold value:</label>
        <input
          type="number"
          id="cutoff"
          value={inputCutoff}
          onChange={(e) => setInputCutoff(e.target.value)}
          min="1"
          required
        />
        <button style={{fontWeight:"700"}} type="submit">Fetch Skill Clusters</button>
      </form>
      <div className="container">
        {clusters.length > 0 ? (
          clusters.map((cluster, index) => (
            <div key={index} className="card">
              <h3 className="card-title">Cluster {index + 1}</h3>
              <div className="tags">
                {cluster.map((skill, i) => (
                  <span key={i} className="tag">{skill}</span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No data available</div>
        )}
      </div>
    </>
  );
};

export default FrequentSkillsPage;
