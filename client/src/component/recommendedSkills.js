import React, { useState } from 'react';
import { TextField, Button, Chip, Typography, Box, Container, Grid, Paper } from '@mui/material';
import axios from 'axios';
import apiList from "../modules/apiList"

const SkillRecommendation = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [recommendedSkills, setRecommendedSkills] = useState([]);

  const handleSkillInputChange = (event) => {
    setNewSkill(event.target.value);
  };

  const handleAddSkill = () => {
    if (newSkill && !userSkills.includes(newSkill)) {
      setUserSkills([...userSkills, newSkill]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setUserSkills(userSkills.filter((skill) => skill !== skillToDelete));
  };

  const handleRecommendSkills = async () => {
    try {
      const response = await axios.post(`${apiList.server}/api/recommend-skills`, { userSkills });
      setRecommendedSkills(response.data.recommendedSkills);
    } catch (error) {
      console.error('Error fetching recommended skills:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '80px 20px',
          textAlign: 'center',
          color: 'black',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', color:"black" }}>
          Skill Recommendations
        </Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Enhance your skillset and advance your career
        </Typography>
      </Box>

      {/* Add Skills Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: -6,
          mb: 4,
          borderRadius: '10px',
          bgcolor: 'white',
          color: 'black',
          border: '1px solid black',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Add Your Current Skills
        </Typography>
        <TextField
          label="Add a Skill"
          value={newSkill}
          onChange={handleSkillInputChange}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ style: { color: 'black' } }} // black label
          sx={{
            input: { color: 'black' },
            fieldset: { borderColor: 'black' },
            '& .MuiOutlinedInput-root:hover fieldset': { borderColor: 'black' },
           
          }}
        />
        <Button variant="contained" onClick={handleAddSkill} fullWidth sx={{ bgcolor: 'white', color: 'black', mt: 2,  ":hover":{
                bgcolor:"white",
                color:"black"
            } }}>
          Add Skill
        </Button>

        <Box my={2}>
          <Typography variant="h6">Your Current Skills</Typography>
          <Box>
            {userSkills.length > 0 ? (
              userSkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleDeleteSkill(skill)}
                  style={{ margin: '5px', color: 'black', border: '1px solid black' }}
                  variant="outlined"
                />
              ))
            ) : (
              <Typography sx={{ mt: 2 }}>No skills added yet.</Typography>
            )}
          </Box>
        </Box>

        <Button variant="contained" onClick={handleRecommendSkills} fullWidth sx={{ bgcolor: 'white', color: 'black', ":hover":{
                bgcolor:"white",
                color:"black"
            } }}>
          Get Recommended Skills
        </Button>
      </Paper>

      {/* Recommended Skills Section */}
      {recommendedSkills.length > 0 && (
        <Box my={4}>
          <Typography variant="h4" gutterBottom sx={{ color: 'black' }}>
            Recommended Skills
          </Typography>
          <Grid container spacing={2}>
            {recommendedSkills.map((skillObj, index) => (
              <Grid item xs={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    padding: '10px',
                    textAlign: 'center',
                    bgcolor: 'white',
                    color: 'black',
                    border: '1px solid black',
                  }}
                >
                  <Chip label={skillObj.skill} sx={{ color: 'black', borderColor: 'black' }} variant="outlined" />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default SkillRecommendation;
