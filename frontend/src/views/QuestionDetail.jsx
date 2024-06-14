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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editResponseId, setEditResponseId] = useState(null);
  const [editResponseText, setEditResponseText] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchQuestion();
  }, [id]);

  const fetchCurrentUser = () => {
    axiosClient.get('/user')
      .then(({ data }) => {
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
      });
  };

  const fetchQuestion = () => {
    axiosClient.get(`/community/questions/${id}`)
      .then(({ data }) => {
        setQuestion(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching question:', error);
        setLoading(false);
      });
  };

  const handleEditResponse = (responseId, responseText) => {
    setEditResponseId(responseId);
    setEditResponseText(responseText);
    setOpenEditDialog(true);
  };

  const handleSaveEditResponse = () => {
    axiosClient.put(`/community/responses/${editResponseId}`, { response: editResponseText })
      .then(({ data }) => {
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          responses: prevQuestion.responses.map((response) =>
            response.id === editResponseId ? { ...response, response: editResponseText } : response
          ),
        }));
        setOpenEditDialog(false);
      })
      .catch((error) => {
        console.error('Error updating response:', error);
      });
  };

  const handleDeleteResponse = (responseId) => {
    setResponseToDelete(responseId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDeleteResponse = () => {
    axiosClient.delete(`/community/responses/${responseToDelete}`)
      .then(() => {
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          responses: prevQuestion.responses.filter((response) => response.id !== responseToDelete),
        }));
        setOpenDeleteDialog(false);
        setResponseToDelete(null);
      })
      .catch((error) => {
        console.error('Error deleting response:', error);
      });
  };

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
                  <Typography variant="caption" color="textSecondary">
                    - {response.user.name}
                  </Typography>
                  {currentUser && response.user.id === currentUser.id && (
                    <Box display="flex" justifyContent="flex-end">
                      <IconButton onClick={() => handleEditResponse(response.id, response.response)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteResponse(response.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Response Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Response</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            value={editResponseText}
            onChange={(e) => setEditResponseText(e.target.value)}
            variant="outlined"
            margin="normal"
            label="Response"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEditResponse} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this response?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteResponse} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
