import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../axios-client';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

export default function ResponsesPage() {
  const { questionId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = () => {
    axiosClient
      .get(`/community/questions/${questionId}/responses`)
      .then(({ data }) => {
        setResponses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching responses:', error);
        setLoading(false);
      });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Responses for Question {questionId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {responses.map((response) => (
            <Typography key={response.id} variant="body1">
              {response.response}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
