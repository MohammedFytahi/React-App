import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faUserPlus, faCaretDown } from "@fortawesome/free-solid-svg-icons";

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();
    const [projectId, setProjectId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [assigningTask, setAssigningTask] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null); 
    const [selectedTaskId, setSelectedTaskId] = useState(null); 
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getTasks();
        getProjects();
    }, [projectId]);

    const onDeleteClick = (task) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        axiosClient
            .delete(`/tasks/${task.id}`)
            .then(() => {
                setNotification("Task was successfully deleted");
                getTasks();
            })
            .catch((error) => {
                console.error("Error deleting task:", error);
            });
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
        axiosClient
            .get("/users")
            .then(({ data }) => {
                setUsers(data.data);
                setAssigningTask(task);
                setSelectedTaskId(task.id); 
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    };

    const handleAssignUser = (userId) => {
        if (!userId || !assigningTask) return;
    
        const taskId = assigningTask.id; 
        if (!taskId) {
            console.error("Task ID is missing");
            return;
        }
    
        axiosClient
            .post(`/tasks/${taskId}/assign`, { user_id: userId, task_id: taskId }) 
            .then(() => {
                setNotification("Task assigned successfully");
                setAssigningTask(null);
                getTasks();
            })
            .catch((error) => {
                console.error("Error assigning task:", error);
            });
    
        setSelectedUserId(userId);
    };
    

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Tasks</h1>
                {user.role === "manager" && (
                    <Link className="btn-add" to="/tasks/new">
                        Add new
                    </Link>
                )}
            </div>
            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="project">Filter by Project:</label>
                <div className="select-container">
                    <select
                        id="project"
                        onChange={handleProjectChange}
                        value={projectId || ""}
                    >
                        <option value="">All Projects</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <FontAwesomeIcon icon={faCaretDown} />
                </div>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            {user.role === "manager" && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : tasks && tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr key={task.id}>
                                    <td>{task.id}</td>
                                    <td>{task.name}</td>
                                    <td>{task.description}</td>
                                    <td>{task.start_date}</td>
                                    <td>{task.end_date}</td>
                                    {user.role === "manager" && (
                                        <td>
                                            <Link className="btn-edit" to={`/tasks/${task.id}`}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Link>
                                            &nbsp;
                                            <button className="btn-delete" onClick={() => onDeleteClick(task)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className="btn-assign" onClick={() => assignTaskToUser(task)}>
                                                <FontAwesomeIcon icon={faUserPlus} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {assigningTask && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Assign Task to User</h2>
                        <select onChange={(e) => handleAssignUser(e.target.value)}>
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => setAssigningTask(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
