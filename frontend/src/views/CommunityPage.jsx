import React, { useState, useEffect } from 'react';
import axiosClient from '../axios-client';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function CommunityForm() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    axiosClient
      .get('/api/projects')
      .then(({ data }) => {
        setProjects(data.data);
        if (data.data.length > 0) {
          setSelectedProject(data.data[0].id); 
        }
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  const handlePostQuestion = () => {
    if (newQuestion.trim() && selectedProject) {
      axiosClient
        .post('/api/questions', { project_id: selectedProject, question: newQuestion })
        .then(() => {
          setNewQuestion('');
          alert('Question posted successfully');
        })
        .catch((error) => {
          console.error("Error posting question:", error);
        });
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Post a New Question
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="project-select-label">Select Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          label="Select Project"
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        placeholder="Ask a question"
        variant="outlined"
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handlePostQuestion}>
        Post Question
      </Button>
    </Box>
  );
}
