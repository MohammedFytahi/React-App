import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faProjectDiagram, faTasks } from "@fortawesome/free-solid-svg-icons";


export default function Dashboard() {
    const [projectStats, setProjectStats] = useState({});
    const [as400UsersWithTasks, setAs400UsersWithTasks] = useState([]);
    const [webUsersWithTasks, setWebUsersWithTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axiosClient
            .get("/project-stats")
            .then(({ data }) => {
                setLoading(false);
                setProjectStats(data);
            })
            .catch((error) => {
                console.error("Error fetching project stats:", error);
                setLoading(false);
            });

        axiosClient
            .get("/user-tasks")
            .then(({ data }) => {
                setLoading(false);
                setAs400UsersWithTasks(data.as400Users);
                setWebUsersWithTasks(data.webUsers);
            })
            .catch((error) => {
                console.error("Error fetching user tasks:", error);
                setLoading(false);
            });
    };

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {loading ? (
                <p className="loading">Loading...</p>
            ) : (
                <div>
                    <div className="stats-section">
                        <h2>Project Statistics</h2>
                        <div className="card">
                            <FontAwesomeIcon icon={faProjectDiagram} className="card-icon" />
                            <div className="card-content">
                                <span className="card-title">Total Projects</span>
                                <span className="card-value">{projectStats.totalProjects}</span>
                            </div>
                        </div>
                        <div className="card">
                            <FontAwesomeIcon icon={faTasks} className="card-icon" />
                            <div className="card-content">
                                <span className="card-title">Total Tasks</span>
                                <span className="card-value">{projectStats.totalTasks}</span>
                            </div>
                        </div>
                    </div>

                    <div className="tasks-section">
                        <h2>AS400 User Tasks</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Tasks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {as400UsersWithTasks.map((user) => (
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

                        <h2>WEB User Tasks</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Tasks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webUsersWithTasks.map((user) => (
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
                </div>
            )}
        </div>
    );
}
