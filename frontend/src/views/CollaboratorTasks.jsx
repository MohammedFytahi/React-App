import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import {
  Box,
  CircularProgress,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Divider,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { styled } from '@mui/system';

const StatusChip = styled(Chip)(({ status }) => ({
  marginLeft: 8,
  backgroundColor: status === 'completed' 
    ? '#4caf50' 
    : status === 'in_progress' 
    ? '#2196f3' 
    : '#ff9800',
  color: '#fff',
}));

const TaskContainer = styled(Box)({
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
});

const TaskDetails = styled(Box)({
  marginBottom: 16,
});

const DayProgress = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
});

export default function CollaboratorTasks() {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient.get("/collaborators/tasks")
      .then(({ data }) => {
        setLoading(false);
        setCollaborators(data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching collaborators:", error);
      });
  }, []);

  const handleTimeChange = (taskId, dayIndex, value) => {
    // Implement the logic to update the time for a specific day
    console.log(`Updating task ${taskId}, day ${dayIndex} with value ${value}`);
  };

  const calculateDurationInDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return { days };
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Collaborator Tasks
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Collaborator</TableCell>
              </TableRow> 
            </TableHead>
            <TableBody>
              {collaborators.map((collaborator) => (
                <React.Fragment key={collaborator.id}>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">{collaborator.name}</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {collaborator.tasks.map((task) => {
                            const { days } = calculateDurationInDays(task.start_date, task.end_date);
                            return (
                              <TaskContainer key={task.id}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <TaskDetails>
                                      <Typography variant="body1"><strong>Project:</strong> {task.project_name}</Typography>
                                      <Typography variant="body1"><strong>Task:</strong> {task.name}</Typography>
                                      <Typography variant="body1"><strong>Description:</strong> {task.description}</Typography>
                                      <Typography variant="body1"><strong>Start Date:</strong> {task.start_date}</Typography>
                                      <Typography variant="body1"><strong>End Date:</strong> {task.end_date}</Typography>
                                      <Typography variant="body1"><strong>Duration:</strong> {days} days</Typography>
                                    </TaskDetails>
                                    <Divider />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    {Array.from({ length: days }).map((_, dayIndex) => (
                                      <DayProgress key={`${task.id}-day-${dayIndex}`}>
                                        <Typography>Day {dayIndex + 1}</Typography>
                                        <Tooltip title={`${task.timeSpent[dayIndex] || 0} hours`}>
                                          <TextField
                                            type="number"
                                            inputProps={{ min: 0, max: 1, step: 0.5 }}
                                            value={task.timeSpent[dayIndex] || 0}
                                            onChange={(e) => handleTimeChange(task.id, dayIndex, parseFloat(e.target.value))}
                                            sx={{ width: '50%' }}
                                          />
                                        </Tooltip>
                                      </DayProgress>
                                    ))}
                                  </Grid>
                                </Grid>
                              </TaskContainer>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
