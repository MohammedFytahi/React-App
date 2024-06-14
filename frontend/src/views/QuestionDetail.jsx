import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../axios-client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/community/questions/${id}`)
      .then(({ data }) => {
        setQuestion(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching question:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!question) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Typography variant="h6">Question not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button variant="contained" color="primary" component={Link} to="/questions">
        Back to Questions
      </Button>
      <Card style={{ width: '100%', maxWidth: '800px', margin: '20px auto' }}>
        <CardHeader
          avatar={<Avatar src={question.user.avatarUrl} />}
          title={question.user.name}
          subheader={`Asked by: ${question.user.name}`}
        />
        <CardContent>
          <Typography variant="body1">{question.question}</Typography>
          {question.responses && question.responses.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6">Responses:</Typography>
              {question.responses.map((response) => (
                <Box key={response.id} mb={1} p={2} bgcolor="#f0f0f0" borderRadius="4px">
                  <Typography variant="body2">{response.response}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
