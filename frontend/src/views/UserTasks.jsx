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

const WeekProgress = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
});

export default function UserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      axiosClient.get("/user")
        .then(({ data }) => {
          setUserId(data.id);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getUserTasks(userId);
    }
  }, [userId]);

  const getUserTasks = (userId) => {
    setLoading(true);
    axiosClient
      .get(`/users/${userId}/tasks`)
      .then(({ data }) => {
        setLoading(false);
        const tasksData = data.data;
        setTasks(tasksData);

        const initialProgress = tasksData.reduce((acc, task) => {
          acc[task.id] = task.progress || Array(calculateDurationInWeeks(task.start_date, task.end_date).weeks).fill(0);
          return acc;
        }, {});
        setProgress(initialProgress);

        const initialStatus = tasksData.reduce((acc, task) => {
          acc[task.id] = task.status || 'pending';
          return acc;
        }, {});
        setStatus(initialStatus);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching user tasks:", error);
      });
  };

  const handleProgressChange = (taskId, weekIndex, value) => {
    const updatedProgress = {
      ...progress,
      [taskId]: progress[taskId].map((val, idx) => (idx === weekIndex ? value : val)),
    };
    setProgress(updatedProgress);

    axiosClient
      .put(`/tasks/${taskId}/progress`, { weekIndex, value })
      .catch((error) => {
        console.error("Error updating progress:", error);
      });
  };

  const handleStatusChange = (taskId, newStatus) => {
    axiosClient
      .put(`/tasks/${taskId}/status`, { status: newStatus })
      .then(() => {
        setStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: newStatus,
        }));
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const calculateDurationInWeeks = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    const weeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
    return { weeks };
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Tasks
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
                <TableCell>Task</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const { weeks } = calculateDurationInWeeks(task.start_date, task.end_date);
                return (
                  <React.Fragment key={task.id}>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6">{task.name}</Typography>
                              <StatusChip
                                label={status[task.id]}
                                status={status[task.id]}
                                icon={
                                  status[task.id] === 'completed' ? (
                                    <AssignmentTurnedInIcon />
                                  ) : status[task.id] === 'in_progress' ? (
                                    <AccessTimeIcon />
                                  ) : (
                                    <PendingActionsIcon />
                                  )
                                }
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TaskContainer>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TaskDetails>
                                    <Typography variant="body1"><strong>Description:</strong> {task.description}</Typography>
                                    <Typography variant="body1"><strong>Start Date:</strong> {task.start_date}</Typography>
                                    <Typography variant="body1"><strong>End Date:</strong> {task.end_date}</Typography>
                                    <Typography variant="body1"><strong>Duration:</strong> {weeks} weeks</Typography>
                                  </TaskDetails>
                                  <Divider />
                                  <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                      value={status[task.id]}
                                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    >
                                      <MenuItem value="pending">Pending</MenuItem>
                                      <MenuItem value="in_progress">In Progress</MenuItem>
                                      <MenuItem value="completed">Completed</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  {Array.from({ length: weeks }).map((_, weekIndex) => (
                                    <WeekProgress key={`${task.id}-week-${weekIndex}`}>
                                      <Typography>Week {weekIndex + 1}</Typography>
                                      <Tooltip title={`${progress[task.id] ? progress[task.id][weekIndex] : 0}%`}>
                                        <Slider
                                          value={progress[task.id] ? progress[task.id][weekIndex] : 0}
                                          onChange={(e, value) => handleProgressChange(task.id, weekIndex, value)}
                                          aria-labelledby="continuous-slider"
                                          valueLabelDisplay="auto"
                                          min={0}
                                          max={100}
                                          sx={{ width: '80%' }}
                                        />
                                      </Tooltip>
                                    </WeekProgress>
                                  ))}
                                </Grid>
                              </Grid>
                            </TaskContainer>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
