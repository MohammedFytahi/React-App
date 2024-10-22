import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faUserPlus,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [projectId, setProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedAs400UserId, setSelectedAs400UserId] = useState(null);
  const [selectedWebUserId, setSelectedWebUserId] = useState(null);
  const [as400Users, setAs400Users] = useState([]);
  const [webUsers, setWebUsers] = useState([]);
  const [taskAssigned, setTaskAssigned] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    getTasks();
    getProjects();
  }, [projectId]);

  const onDeleteClick = (task) => {
    setTaskToDelete(task);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    axiosClient
      .delete(`/tasks/${taskToDelete.id}`)
      .then(() => {
        setNotification("Task was successfully deleted");
        getTasks();
        setOpenDeleteDialog(false);
        setTaskToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
        setOpenDeleteDialog(false);
      });
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTaskToDelete(null);
  };

  const getTasks = () => {
    setLoading(true);
    const url = projectId ? `/projects/${projectId}/tasks` : "/tasks";
    axiosClient
      .get(url)
      .then(({ data }) => {
        setLoading(false);
        setTasks(data.data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  };

  const getProjects = () => {
    axiosClient
      .get("/projects")
      .then(({ data }) => {
        setProjects(data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  const handleProjectChange = (e) => {
    setProjectId(e.target.value);
  };

  const assignTaskToUser = (task) => {
    if (taskAssigned) {
      alert("This task is already assigned to users.");
      return;
    }
    axiosClient
      .get("/users")
      .then(({ data }) => {
        console.log("Users fetched: ", data.data); 
        const as400Users = data.data.filter(
          (user) => user.user_type === "AS400"
        );
        const webUsers = data.data.filter((user) => user.user_type === "WEB");
        console.log("AS400 Users: ", as400Users); 
        console.log("WEB Users: ", webUsers); 
        setAs400Users(as400Users);
        setWebUsers(webUsers);
        setAssigningTask(task);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  const handleAssignAs400User = (userId) => {
    setSelectedAs400UserId(userId);
  };

  const handleAssignWebUser = (userId) => {
    setSelectedWebUserId(userId);
  };

  const handleAssignUser = () => {
    if (!selectedAs400UserId || !selectedWebUserId || !assigningTask) return;

    const taskId = assigningTask.id;
    if (!taskId) {
      console.error("Task ID is missing");
      return;
    }

    axiosClient
      .post(`/tasks/${taskId}/assign`, {
        as400_user_id: selectedAs400UserId,
        web_user_id: selectedWebUserId,
        task_id: taskId,
      })
      .then(() => {
        setNotification("Task assigned successfully");
        setAssigningTask(null);
        getTasks();
        setTaskAssigned(true);
      })
      .catch((error) => {
        console.error("Error assigning task:", error);
      });
  };

  const handleAssignedTaskClick = (task) => {
    alert(`This task is already assigned to users.`);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        {user.role === "manager" && (
          <Button
            component={Link}
            to="/tasks/new"
            variant="contained"
            color="primary"
          >
            Add new
          </Button>
        )}
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Project</InputLabel>
          <Select value={projectId || ""} onChange={handleProjectChange}>
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper} className="card animated fadeInDown">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              {user.role === "manager" && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.start_date}</TableCell>
                  <TableCell>{task.end_date}</TableCell>
                  {user.role === "manager" && (
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          component={Link}
                          to={"/tasks/" + task.id}
                          size="small"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="secondary"
                          onClick={() => onDeleteClick(task)}
                          size="small"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Users">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            taskAssigned
                              ? handleAssignedTaskClick(task)
                              : assignTaskToUser(task)
                          }
                          size="small"
                        >
                          <FontAwesomeIcon
                            icon={taskAssigned ? faUserCheck : faUserPlus}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  No Tasks Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={Boolean(assigningTask)}
        onClose={() => setAssigningTask(null)}
      >
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <DialogContentText>Select users to assign to the task:</DialogContentText>
          <FormControl fullWidth margin="normal">
            <InputLabel>AS400 User</InputLabel>
            <Select
              value={selectedAs400UserId || ""}
              onChange={(e) => handleAssignAs400User(e.target.value)}
            >
              {as400Users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>WEB User</InputLabel>
            <Select
              value={selectedWebUserId || ""}
              onChange={(e) => handleAssignWebUser(e.target.value)}
            >
              {webUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssigningTask(null)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAssignUser} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
