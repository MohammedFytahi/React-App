import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { CircularProgress, Typography, Card, CardContent } from "@mui/material";
import styled from 'styled-components';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const UserStatsContainer = styled.div`
    margin-top: 20px;
    background-color: ${props => (props.darkMode ? '#2a2a2a' : '#fff')};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
`;

const SectionTitle = styled(Typography)`
    margin: 20px 0;
    font-weight: bold;
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

const ChartContainer = styled.div`
    width: 400px;
    height: 300px;
    margin: auto;
`;

const FlexContainer = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 20px; // Espacement entre les cartes
`;

export default function UserStats({ darkMode }) {
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/user-stats");
            setUserStats(response.data);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setError("Failed to load user stats.");
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

    const barData = {
        labels: ['Total Tasks', 'Total Questions', 'Total Responses'],
        datasets: [{
            label: 'Count',
            data: [userStats.totalTasks, userStats.totalQuestions, userStats.totalResponses],
            backgroundColor: ['#2196f3', '#4caf50', '#ff9800'],
        }],
    };

    const doughnutData = {
        labels: ['Total Tasks', 'Total Questions', 'Total Responses'],
        datasets: [{
            data: [userStats.totalTasks, userStats.totalQuestions, userStats.totalResponses],
            backgroundColor: ['#2196f3', '#4caf50', '#ff9800'],
        }],
    };

    return (
        <UserStatsContainer darkMode={darkMode}>
            <SectionTitle variant="h4" gutterBottom>
                User Statistics
            </SectionTitle>
            <FlexContainer>
                <Card>
                    <CardContent>
                        <Typography variant="h5">User Statistics Chart</Typography>
                        <ChartContainer>
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant="h5">User Statistics Distribution</Typography>
                        <ChartContainer>
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                        </ChartContainer>
                    </CardContent>
                </Card>
            </FlexContainer>
            <Table>
                <thead>
                    <tr>
                        <TableHeader darkMode={darkMode}>Statistic</TableHeader>
                        <TableHeader darkMode={darkMode}>Value</TableHeader>
                    </tr>
                </thead>
                <tbody>
                    <TableRow darkMode={darkMode}>
                        <TableData>Total Tasks</TableData>
                        <TableData>{userStats.totalTasks}</TableData>
                    </TableRow>
                    <TableRow darkMode={darkMode}>
                        <TableData>Total Questions</TableData>
                        <TableData>{userStats.totalQuestions}</TableData>
                    </TableRow>
                    <TableRow darkMode={darkMode}>
                        <TableData>Total Responses</TableData>
                        <TableData>{userStats.totalResponses}</TableData>
                    </TableRow>
                </tbody>
            </Table>
        </UserStatsContainer>
    );
}
