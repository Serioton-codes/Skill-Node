// src/components/TrendingSkills.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import apiList from "../modules/apiList"
const TrendingSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingSkills = async () => {
      try {
        const response = await axios.get(`${apiList.server}/api/trending-skills`); // Update the API endpoint as needed
        setSkills(response.data.trendingSkills);
      } catch (err) {
        setError('Error fetching trending skills');
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingSkills();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Trending Skills
      </Typography>
      <Grid container spacing={3}>
        {skills.map((skill, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{skill.skill}</Typography>
                <Typography variant="body2" color="textSecondary">
                 Jobs: {skill.degree}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TrendingSkills;
