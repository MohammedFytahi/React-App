import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { CircularProgress, Typography, Grid, Card, CardContent } from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const DashboardContainer = styled.div`
  padding: 20px;
  background-color: ${props => (props.darkMode ? '#1c1c1c' : '#f5f5f5')};
  color: ${props => (props.darkMode ? '#fff' : '#000')};
  transition: background-color 0.3s, color 0.3s;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const DashboardTitle = styled(Typography)`
  margin-bottom: 20px;
  font-weight: bold;
`;

const StatCard = styled(Card)`
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const SectionTitle = styled(Typography)`
  margin: 20px 0;
  font-weight: bold;
`;

const TasksSectionContainer = styled.div`
  margin-top: 20px;
  background-color: ${props => (props.darkMode ? '#2a2a2a' : '#fff')};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
`;

const CollaboratorStatsSectionContainer = styled.div`
  margin-top: 20px;
  background-color: ${props => (props.darkMode ? '#2a2a2a' : '#fff')};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const TableHeader = styled.th`
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid #ddd;
  background-color: ${props => (props.darkMode ? '#333' : '#f4f4f4')};
`;

const TableData = styled.td`
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => (props.darkMode ? '#444' : '#f9f9f9')};
  }
`;

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
            <LoadingContainer>
                <CircularProgress color="primary" size={80} />
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ErrorContainer>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </ErrorContainer>
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
        <DashboardContainer darkMode={darkMode}>
            <DashboardTitle variant="h3" gutterBottom>
                Dashboard
            </DashboardTitle>
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
        </DashboardContainer>
    );
}

function renderStatCard(title, value, color) {
    return (
        <Grid item xs={12} sm={6} md={3} key={title}>
            <StatCard style={{ backgroundColor: color }}>
                <CardContent>
                    <Typography variant="h6" className="stat-title">{title}</Typography>
                    <Typography variant="subtitle1" className="stat-value">{value}</Typography>
                </CardContent>
            </StatCard>
        </Grid>
    );
}

function UserTasksSection({ title, usersWithTasks, darkMode }) {
    return (
        <TasksSectionContainer darkMode={darkMode}>
            <SectionTitle variant="h4" gutterBottom>
                {title}
            </SectionTitle>
            <Table>
                <thead>
                    <tr>
                        <TableHeader darkMode={darkMode}>User</TableHeader>
                        <TableHeader darkMode={darkMode}>Tasks</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {usersWithTasks.map((user) => (
                        <TableRow darkMode={darkMode} key={user.id}>
                            <TableData>{user.name}</TableData>
                            <TableData>
                                <ul>
                                    {user.tasks.map((task) => (
                                        <li key={task.id}>{task.name}</li>
                                    ))}
                                </ul>
                            </TableData>
                        </TableRow>
                    ))}
                </tbody>
            </Table>
        </TasksSectionContainer>
    );
}

function CollaboratorStatsSection({ stats, darkMode }) {
    return (
        <CollaboratorStatsSectionContainer darkMode={darkMode}>
            <SectionTitle variant="h4" gutterBottom>
                Collaborator Stats
            </SectionTitle>
            <Table>
                <thead>
                    <tr>
                        <TableHeader darkMode={darkMode}>Collaborator</TableHeader>
                        <TableHeader darkMode={darkMode}>Number of Tasks</TableHeader>
                       
                    </tr>
                </thead>
                <tbody>
                    {stats.map((collaborator) => (
                        <TableRow darkMode={darkMode} key={collaborator.id}>
                            <TableData>{collaborator.name}</TableData>
                            <TableData>{collaborator.taskCount}</TableData>
                            
                        </TableRow>
                    ))}
                </tbody>
            </Table>
        </CollaboratorStatsSectionContainer>
    );
}
