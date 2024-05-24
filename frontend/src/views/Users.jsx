import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";

export default function Users({ userType }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    getUsers(userType);
  }, [userType]);

  const onDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    axiosClient
      .delete(`/users/${userToDelete.id}`)
      .then(() => {
        setNotification("User was successfully deleted");
        getUsers(userType);
        setOpenDeleteDialog(false);
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        setOpenDeleteDialog(false);
      });
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const getUsers = (userType) => {
    setLoading(true);
    let url = "/users";
    if (userType) {
      url += `/${userType}`;
    }
    axiosClient
      .get(url)
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching users:", error);
      });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Users</Typography>
        {user.role === "manager" && (
          <Button
            component={Link}
            to="/users/new"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add new
          </Button>
        )}
      </Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button onClick={() => getUsers()} variant="outlined">
            All
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={() => getUsers("AS400")} variant="outlined">
            AS400
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={() => getUsers("WEB")} variant="outlined">
            WEB
          </Button>
        </Grid>
        <Grid item xs>
          <TextField
            variant="outlined"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Create Date</TableCell>
                {user.role === "manager" && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.created_at}</TableCell>
                    {user.role === "manager" && (
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            to={"/users/" + u.id}
                            size="small"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => onDeleteClick(u)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
