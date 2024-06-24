import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { CircularProgress, Typography, Grid, Card, CardContent } from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function Dashboard({ onToggleDarkMode }) {
    const [projectStats, setProjectStats] = useState({});
    const [as400UsersWithTasks, setAs400UsersWithTasks] = useState([]);
    const [webUsersWithTasks, setWebUsersWithTasks] = useState([]);
    const [collaboratorStats, setCollaboratorStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectStatsResponse, userTasksResponse, collaboratorStatsResponse] = await Promise.all([
                axiosClient.get("/project-stats"),
                axiosClient.get("/user-tasks"),
                axiosClient.get("/collaborator-stats"),
            ]);
            setProjectStats(projectStatsResponse.data);
            setAs400UsersWithTasks(userTasksResponse.data.as400Users);
            setWebUsersWithTasks(userTasksResponse.data.webUsers);
            setCollaboratorStats(collaboratorStatsResponse.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load data.");
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

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        onToggleDarkMode();
    };

    const barData = {
        labels: ['Projects', 'Tasks', 'AS400 Users', 'Web Users'],
        datasets: [{
            label: 'Count',
            data: [projectStats.totalProjects, projectStats.totalTasks, projectStats.totalUsers, projectStats.totalWeb],
            backgroundColor: ['#2196f3', '#4caf50', '#f44336', '#ff9800'],
        }],
    };

    const doughnutData = {
        labels: ['AS400 Users', 'Web Users'],
        datasets: [{
            data: [projectStats.totalUsers, projectStats.totalWeb],
            backgroundColor: ['#f44336', '#ff9800'],
        }],
    };

    return (
        <div className={`dashboard ${darkMode ? "dark-mode" : ""}`}>
            <Typography variant="h3" gutterBottom className="dashboard-title">
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {renderStatCard("Total Projects", projectStats.totalProjects, "#2196f3")}
                {renderStatCard("Total Tasks", projectStats.totalTasks, "#4caf50")}
                {renderStatCard("Total AS400 Users", projectStats.totalUsers, "#f44336")}
                {renderStatCard("Total Web Users", projectStats.totalWeb, "#ff9800")}
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Project and User Statistics</Typography>
                            <Bar data={barData} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">User Distribution</Typography>
                            <Doughnut data={doughnutData} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <UserTasksSection title="AS400 User Tasks" usersWithTasks={as400UsersWithTasks} darkMode={darkMode} />
            <UserTasksSection title="WEB User Tasks" usersWithTasks={webUsersWithTasks} darkMode={darkMode} />
            <CollaboratorStatsSection stats={collaboratorStats} darkMode={darkMode} />
        </div>
    );
}

function renderStatCard(title, value, color) {
    return (
        <Grid item xs={12} sm={6} md={3} key={title}>
            <Card className="stat-card" style={{ backgroundColor: color }}>
                <CardContent>
                    <Typography variant="h6" className="stat-title">{title}</Typography>
                    <Typography variant="subtitle1" className="stat-value">{value}</Typography>
                </CardContent>
            </Card>
        </Grid>
    );
}

function UserTasksSection({ title, usersWithTasks, darkMode }) {
    return (
        <div className={`tasks-section ${darkMode ? "dark-mode" : ""}`}>
            <Typography variant="h4" gutterBottom className="section-title">{title}</Typography>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Tasks</th>
                    </tr>
                </thead>
                <tbody>
                    {usersWithTasks.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>
                                <ul>
                                    {user.tasks.map((task) => (
                                        <li key={task.id}>{task.name}</li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CollaboratorStatsSection({ stats, darkMode }) {
    return (
        <div className={`collaborator-stats-section ${darkMode ? "dark-mode" : ""}`}>
            <Typography variant="h4" gutterBottom className="section-title">Collaborator Stats</Typography>
            <table>
                <thead>
                    <tr>
                        <th>Collaborator</th>
                        <th>Number of Tasks</th>
                        <th>Number of Projects</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((collaborator) => (
                        <tr key={collaborator.id}>
                            <td>{collaborator.name}</td>
                            <td>{collaborator.taskCount}</td>
                            <td>{collaborator.projectCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
