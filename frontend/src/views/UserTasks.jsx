import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Box, CircularProgress, Slider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";

export default function UserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState({});

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
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Weeks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const { weeks } = calculateDurationInWeeks(task.start_date, task.end_date);
                return (
                  <React.Fragment key={task.id}>
                    <TableRow>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.start_date}</TableCell>
                      <TableCell>{task.end_date}</TableCell>
                      <TableCell>{weeks} weeks</TableCell>
                    </TableRow>
                    {Array.from({ length: weeks }).map((_, weekIndex) => (
                      <TableRow key={`${task.id}-week-${weekIndex}`}>
                        <TableCell colSpan={4}>Week {weekIndex + 1}</TableCell>
                        <TableCell>
                          <Slider
                            value={progress[task.id] ? progress[task.id][weekIndex] : 0}
                            onChange={(e, value) => handleProgressChange(task.id, weekIndex, value)}
                            aria-labelledby="continuous-slider"
                            valueLabelDisplay="auto"
                            min={0}
                            max={100}
                          />
                          {progress[task.id] ? progress[task.id][weekIndex] : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
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
