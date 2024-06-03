import React, { useState, useEffect } from 'react';
import axiosClient from '../axios-client';
import { Box, Typography, List, Card, CardContent, CardHeader, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Root = styled(Box)({
  padding: '32px',
});

const QuestionCard = styled(Card)({
  marginBottom: '16px',
  backgroundColor: '#fff',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
});

const QuestionText = styled(Typography)({
  fontWeight: '500',
});

const UserAvatar = styled(Avatar)({
  marginRight: '16px',
});

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchQuestions();
  }, []);

  const fetchCurrentUser = () => {
    axiosClient
      .get('/user')
      .then(({ data }) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
      });
  };

  const fetchQuestions = () => {
    axiosClient
      .get('/community/questions')
      .then(({ data }) => {
        setQuestions(data);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      });
  };

  const handleEdit = (questionId, questionText) => {
    setEditQuestionId(questionId);
    setEditQuestionText(questionText);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    axiosClient
      .put(`/community/questions/${editQuestionId}`, { question: editQuestionText })
      .then(({ data }) => {
        // Update the question in the local state
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.id === editQuestionId ? { ...question, question: editQuestionText } : question
          )
        );
        setOpenEditDialog(false);
      })
      .catch((error) => {
        console.error('Error updating question:', error);
      });
  };

  const handleDelete = (questionId) => {
    axiosClient
      .delete(`/community/questions/${questionId}`)
      .then(() => {
        // Remove the question from the local state
        setQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== questionId));
      })
      .catch((error) => {
        console.error('Error deleting question:', error);
      });
  };

  return (
    <Root>
      <Typography variant="h4" gutterBottom>
        All Questions
      </Typography>
      <List>
        {questions.map((question) => (
          <QuestionCard key={question.id} elevation={3}>
            <CardHeader
              avatar={<UserAvatar alt={question.user.name} src={question.user.avatarUrl} />}
              title={question.user.name}
              subheader={`Asked by: ${question.user.name}`}
              action={
                <Box>
                  {currentUser && question.user.id === currentUser.id && (
                    <>
                      <IconButton onClick={() => handleEdit(question.id, question.question)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(question.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              }
            />
            <CardContent>
              <QuestionText>{question.question}</QuestionText>
            </CardContent>
          </QuestionCard>
        ))}
      </List>

      {/* Dialogue de modification */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="editQuestion"
            label="Edit Question"
            type="text"
            fullWidth
            value={editQuestionText}
            onChange={(e) => setEditQuestionText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}
