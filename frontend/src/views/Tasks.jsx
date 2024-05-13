// Import des dépendances nécessaires
import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faUserPlus,
    faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

// Définition du composant
export default function Tasks() {
    // Déclaration des états
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

    // Effet pour récupérer les tâches et les projets au chargement initial ou lorsqu'un projet est sélectionné
    useEffect(() => {
        getTasks();
        getProjects();
    }, [projectId]);

    // Fonction pour supprimer une tâche
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

    // Fonction pour récupérer les tâches depuis le backend
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

    // Fonction pour récupérer les projets depuis le backend
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

    // Gestionnaire de changement de projet
    const handleProjectChange = (e) => {
        setProjectId(e.target.value);
    };

    // Fonction pour attribuer une tâche à un utilisateur
    const assignTaskToUser = (task) => {
        axiosClient
            .get("/users")
            .then(({ data }) => {
                const as400Users = data.data.filter(
                    (user) => user.user_type === "AS400"
                );
                const webUsers = data.data.filter(
                    (user) => user.user_type === "WEB"
                );
                setAs400Users(as400Users);
                setWebUsers(webUsers);
                setAssigningTask(task);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    };

    // Gestionnaire de sélection d'utilisateur AS400
    const handleAssignAs400User = (userId) => {
        setSelectedAs400UserId(userId);
    };

    // Gestionnaire de sélection d'utilisateur Web
    const handleAssignWebUser = (userId) => {
        setSelectedWebUserId(userId);
    };

    // Fonction pour attribuer la tâche à l'utilisateur sélectionné
    const handleAssignUser = () => {
        if (!selectedAs400UserId || !selectedWebUserId || !assigningTask)
            return;

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
            })
            .catch((error) => {
                console.error("Error assigning task:", error);
            });
    };

    // Retourne le JSX du composant
    return (
        <div>
            {/* Affichage du titre et du bouton d'ajout */}
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
            {/* Filtrage par projet */}
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
            {/* Affichage des tâches */}
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
                                            <Link
                                                className="btn-edit"
                                                to={`/tasks/${task.id}`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                />
                                            </Link>
                                            &nbsp;
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    onDeleteClick(task)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </button>
                                            <button
                                                className="btn-assign"
                                                onClick={() =>
                                                    assignTaskToUser(task)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faUserPlus}
                                                />
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
            {/* Modal pour attribuer la tâche à un utilisateur */}
            {assigningTask && (
                 <div className="modal">
                 <div className="modal-content">
                     <h2>Assign Task to User</h2>
                     {/* Sélecteur pour choisir l'utilisateur AS400 */}
                     <select
                         onChange={(e) =>
                             handleAssignAs400User(e.target.value)
                         }
                     >
                         <option value="">Select AS400 User</option>
                         {/* Affichage des utilisateurs AS400 */}
                         {as400Users.map((user) => (
                             <option key={user.id} value={user.id}>
                                 {user.name}
                             </option>
                         ))}
                     </select>
                     {/* Sélecteur pour choisir l'utilisateur Web */}
                     <select
                         onChange={(e) =>
                             handleAssignWebUser(e.target.value)
                         }
                     >
                         <option value="">Select Web User</option>
                         {webUsers.map((user) => (
                             <option key={user.id} value={user.id}>
                                 {user.name}
                             </option>
                         ))}
                     </select>
                 
                     <button className="ass_button" onClick={handleAssignUser}>Assign</button>
                     <button className="cancel_button" onClick={() => setAssigningTask(null)}>
                         Cancel
                     </button>
                 </div>
             </div>
            )}
        </div>
    );
}
