import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CircularProgress,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material';

function UserDashboard() {
    const [usersWithTasks, setUsersWithTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/user-tasks/1'); // Remplacez 1 par l'ID de l'utilisateur souhaité
            setUsersWithTasks(response.data); // Assurez-vous que la structure de response.data correspond à ce qui est attendu
        } catch (error) {
            console.error('Failed to fetch user tasks:', error);
            setError('Failed to fetch user tasks. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress color="primary" size={80} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <Typography variant="h3" gutterBottom>
                User Dashboard
            </Typography>
            <Grid container spacing={3}>
                {usersWithTasks.map((user) => (
                    <Grid item key={user.user_id} xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {user.user_name}'s Tasks ({user.task_count})
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task ID</TableCell>
                                            <TableCell>Task Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Vous pouvez afficher ici les détails des tâches si nécessaire */}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default UserDashboard;
