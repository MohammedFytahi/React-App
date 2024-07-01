import React, { useState, useEffect } from 'react';
import axiosClient from '../axios-client';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';

export default function CommunityForm() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    axiosClient
      .get('/projects')
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
      setLoading(true);
      axiosClient
        .post('/questions', { project_id: selectedProject, question: newQuestion })
        .then(() => {
          setNewQuestion('');
          setSuccessMessage('Question posted successfully');
        })
        .catch((error) => {
          setError('Error posting question. Please try again later.');
          console.error("Error posting question:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
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
      <Button
        variant="contained"
        color="primary"
        onClick={handlePostQuestion}
        disabled={loading}
      >
        {loading ? 'Posting...' : 'Post Question'}
      </Button>
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error || successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
