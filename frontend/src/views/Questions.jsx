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
  Avatar,
  Slide,
} from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Root = styled(Box)(({ theme }) => ({
  padding: '40px',
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const Header = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(6),
  paddingBottom: theme.spacing(2),
  borderBottom: '2px solid #e0e0e0',
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  marginBottom: theme.spacing(4),
  backgroundColor: '#ffffff',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  overflow: 'visible',
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  fontWeight: '500',
  fontSize: '1.2rem',
  color: '#333',
  marginBottom: theme.spacing(2),
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
  border: '2px solid #0288d1',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0288d1',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#01579b',
  },
  textTransform: 'none',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
}));

const StyledDialog = ({ open, onClose, title, children, onSave }) => (
  <Dialog open={open} onClose={onClose} TransitionComponent={Slide} keepMounted>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSave} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

const StyledConfirmationDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} TransitionComponent={Slide} keepMounted>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to delete this question?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="secondary">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddResponseDialog, setOpenAddResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const navigate = useNavigate();

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
        const formattedQuestions = data.map((question) => ({
          ...question,
          responses: question.responses || [],
        }));
        setQuestions(formattedQuestions);
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
    setQuestionToDelete(questionId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    axiosClient
      .delete(`/community/questions/${questionToDelete}`)
      .then(() => {
        setQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== questionToDelete));
        setOpenDeleteDialog(false);
        setQuestionToDelete(null);
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
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.id === currentQuestionId ? { ...question, responses: [...question.responses, data] } : question
          )
        );
        setOpenAddResponseDialog(false);
        setResponseText('');
      })
      .catch((error) => {
        console.error('Error adding response:', error);
      });
  };

  const handleCardClick = (questionId) => {
    navigate(`/questions/${questionId}`);
  };

  return (
    <Root>
      <Header>
        <Typography variant="h4" gutterBottom>
          All Questions
        </Typography>
        <StyledButton variant="contained" component={Link} to="/projects//community-form">
          Add new
        </StyledButton>
      </Header>
      <List>
        {questions.map((question) => (
          <Slide direction="up" in key={question.id}>
            <QuestionCard elevation={3} onClick={() => handleCardClick(question.id)}>
              <CardHeader
                avatar={<UserAvatar alt={question.user.name} src={question.user.avatarUrl} />}
                title={question.user.name}
                subheader={`Asked by: ${question.user.name}`}
                action={
                  <Box>
                    {currentUser && question.user.id === currentUser.id && (
                      <>
                        <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(question.id, question.question); }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(question.id); }}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton onClick={(e) => { e.stopPropagation(); handleAddResponse(question.id); }}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent>
                <QuestionText>{question.question}</QuestionText>
                {question.responses && question.responses.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6">Responses:</Typography>
                    <List>
                      {question.responses.map((response) => (
                        <Box key={response.id} mb={1} p={2} bgcolor="#f0f0f0" borderRadius="4px">
                          <Typography variant="body2">{response.response}</Typography>
                        </Box>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </QuestionCard>
          </Slide>
        ))}
      </List>

      <StyledDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Edit Question"
        onSave={handleSaveEdit}
      >
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
      </StyledDialog>

      <StyledDialog
        open={openAddResponseDialog}
        onClose={() => setOpenAddResponseDialog(false)}
        title="Add Response"
        onSave={handleSaveResponse}
      >
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
      </StyledDialog>

      <StyledConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </Root>
  );
}
