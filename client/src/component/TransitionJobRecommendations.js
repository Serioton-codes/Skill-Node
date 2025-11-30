// src/JobRecommendationsPage.js
import React, { useState } from 'react';
import './Frequent.css'; // Import the CSS file for styles
import apiList from "../modules/apiList"

const JobRecommendationsPage = () => {
  const [knownSkills, setKnownSkills] = useState([]);
  const [inputSkill, setInputSkill] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(''); // To handle form validation errors
  const [showInput, setShowInput] = useState(true); // State to manage input field visibility

  const addSkill = () => {
    if (inputSkill.trim() && !knownSkills.includes(inputSkill.trim())) {
      setKnownSkills([...knownSkills, inputSkill.trim()]);
      setInputSkill('');
      setFormError('');
    } else if (!inputSkill.trim()) {
      setFormError('Skill cannot be empty.');
    } else {
      setFormError('Skill already added.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (knownSkills.length === 0) {
      setFormError('Please add at least one skill.');
      return;
    }

    setLoading(true);
    setFormError(''); // Clear previous errors

    try {
      const response = await fetch(`${apiList.server}/api/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knownSkills })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Filter out jobs with null totalDistance, no jobId, and sort by totalDistance
      const filteredAndSorted = data
        .filter(job => job.jobId && job.requiredSkills.length > 0 && Number.isFinite(job.totalDistance))
        .sort((a, b) => a.totalDistance - b.totalDistance)
        .slice(0, 3); // Get top 3 jobs

      setRecommendations(filteredAndSorted);
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      setFormError('Failed to fetch job recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{fontSize:"3.6rem" ,color: 'green',marginBottom:"0PX" }}>Job Recommendations</h1>
      <p style={{fontWeight:"700"}}>Enter your skills and get recommendations for best jobs that match/nearly match your skillsets.</p>
      <form onSubmit={handleSubmit} className="cutoff-form">
        {showInput ? (
          <>
            <label htmlFor="skill">Enter skills:</label>
            <input
              type="text"
              id="skill"
              value={inputSkill}
              onChange={(e) => setInputSkill(e.target.value)}
              required
            />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <button type="button" onClick={addSkill}>Add Skill</button>
              <button style={{ marginLeft: '5px' }} type="button" onClick={() => setShowInput(false)}>Done</button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => setShowInput(true)}>Add More Skills</button>
        )}
        <button type="submit">Get Recommendations</button>
      </form>
      {formError && <div className="form-error">{formError}</div>}
      <div className="tags-container">
        <h2>Known Skills</h2>
        <div className="tags">
          {knownSkills.map((skill, index) => (
            <span key={index} className="tag">{skill}</span>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="container">
          {recommendations.length > 0 ? (
            recommendations.map((job, index) => (
              <div key={index} className="card">
                <h3 className="card-title">Job {index + 1}</h3>
                <div className="tags">
                  <span className="tag">Job ID: {job.jobId}</span>
                  <span className="tag">Total Distance: {job.totalDistance.toFixed(2)}</span>
                  <span className="tag">Required Skills: {job.requiredSkills.join(', ')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No job recommendations available</div>
          )}
        </div>
      )}
    </>
  );
};

export default JobRecommendationsPage;
