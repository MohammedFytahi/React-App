import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  PendingActions as PendingActionsIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    getProjects();
  }, []);

  const onDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;

    axiosClient
      .delete(`/projects/${projectToDelete.id}`)
      .then(() => {
        setNotification("Project was successfully deleted");
        setDeleteDialogOpen(false);
        getProjects();
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
      });
  };

  const getProjects = () => {
    setLoading(true);
    axiosClient
      .get("/projects")
      .then(({ data }) => {
        setLoading(false);
        setProjects(data.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  };

  const limitWords = (text, limit) => {
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingActionsIcon />} label="Pending" color="default" />;
      case 'in_progress':
        return <Chip icon={<HourglassEmptyIcon />} label="In Progress" color="primary" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPPP');
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        {user.role === "manager" && (
          <Button variant="contained" color="primary" component={Link} to="/projects/new">
            Add new
          </Button>
        )}
      </Box>
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Techno</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Web Status</TableCell>
                <TableCell>AS400 Status</TableCell>
                {user.role === "manager" && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{limitWords(project.description, 10)}</TableCell>
                    <TableCell>{project.techno}</TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell>{getStatusChip(project.status)}</TableCell>
                    <TableCell>{getStatusChip(project.as400_status)}</TableCell>
                    {user.role === "manager" && (
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            color="default"
                            component={Link}
                            to={`/projects/${project.id}`}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="secondary"
                            onClick={() => onDeleteClick(project)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Tasks">
                          <IconButton
                            color="default"
                            component={Link}
                            to={`/projects/${project.id}/tasks`}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "
            {projectToDelete ? projectToDelete.name : ""}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
