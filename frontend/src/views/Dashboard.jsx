import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faProjectDiagram, faTasks, faUser } from "@fortawesome/free-solid-svg-icons";
import { Chart as ChartJs } from "chart.js/auto";

export default function Dashboard() {
    const [projectStats, setProjectStats] = useState({});
    const [as400UsersWithTasks, setAs400UsersWithTasks] = useState([]);
    const [webUsersWithTasks, setWebUsersWithTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectStatsResponse, userTasksResponse] = await Promise.all([
                axiosClient.get("/project-stats"),
                axiosClient.get("/user-tasks"),
            ]);
            setProjectStats(projectStatsResponse.data);
            setAs400UsersWithTasks(userTasksResponse.data.as400Users);
            setWebUsersWithTasks(userTasksResponse.data.webUsers);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-section">

                <h2>Project Statistics</h2>
                <div className="stat">
                     <div className="card">
                    <FontAwesomeIcon icon={faProjectDiagram} className="card-icon" />
                    <div className="card-content">
                        <span className="card-title">Total Projects</span>
                        <span className="card-value">{projectStats.totalProjects}</span>
                    </div>
                </div>
                <div className="card">
                    <FontAwesomeIcon icon={faTasks} className="card-icon0" />
                    <div className="card-content">
                        <span className="card-title">Total Tasks</span>
                        <span className="card-value">{projectStats.totalTasks}</span>
                    </div>
                </div>
                <div className="card">
                    <FontAwesomeIcon icon={faUser} className="card-icon1" />
                    <div className="card-content">
                        <span className="card-title">Total AS400 Users</span>
                        <span className="card-value">{projectStats.totalUsers}</span>
                    </div>
                </div>
                 <div className="card">
                    <FontAwesomeIcon icon={faUser} className="card-icon2" />
                    <div className="card-content">
                        <span className="card-title">Total Web Users</span>
                        <span className="card-value">{projectStats.totalWeb}</span>
                    </div>
                </div>
               
                </div>
            </div>
            <UserTasksSection title="AS400 User Tasks" usersWithTasks={as400UsersWithTasks} />
            <UserTasksSection title="WEB User Tasks" usersWithTasks={webUsersWithTasks} />
        </div>
    );
}

function UserTasksSection({ title, usersWithTasks }) {
    return (
        <div className="tasks-section">
            <h2>{title}</h2>
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
