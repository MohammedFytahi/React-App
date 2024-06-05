import React, { useState, useEffect } from 'react';
import axiosClient from '../axios-client';
import {
  Box,
  Typography,
  List,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Root = styled(Box)(({ theme }) => ({
  padding: '32px',
  backgroundColor: '#e0f7fa',
  minHeight: '100vh',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: '16px',
  backgroundColor: '#ffffff',
  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    backgroundColor: '#e0f7fa',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  borderRadius: '12px',
  padding: '16px',
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  fontWeight: '500',
  fontSize: '1.1rem',
  color: '#333',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
  border: '2px solid #00796b',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#00796b',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#004d40',
  },
  textTransform: 'none',
}));

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddResponseDialog, setOpenAddResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

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
        setQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== questionId));
      })
      .catch((error) => {
        console.error('Error deleting question:', error);
      });
  };

  const handleAddResponse = (questionId) => {
    setCurrentQuestionId(questionId);
    setOpenAddResponseDialog(true);
  };

  const handleSaveResponse = () => {
    axiosClient
      .post(`/community/questions/${currentQuestionId}/responses`, { response: responseText })
      .then(({ data }) => {
        setOpenAddResponseDialog(false);
      })
      .catch((error) => {
        console.error('Error adding response:', error);
      });
  };

  return (
    <Root>
      <Header>
        <Typography variant="h4" gutterBottom>
          All Questions
        </Typography>
        <StyledButton variant="contained" component={Link} to="/projects/community-form">
          Add new
        </StyledButton>
      </Header>
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
                  <IconButton onClick={() => handleAddResponse(question.id)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent>
              <QuestionText>{question.question}</QuestionText>
            </CardContent>
          </QuestionCard>
        ))}
      </List>

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
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openAddResponseDialog} onClose={() => setOpenAddResponseDialog(false)}>
        <DialogTitle>Add Response</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="addResponse"
            label="Response"
            type="text"
            fullWidth
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddResponseDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveResponse} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}
