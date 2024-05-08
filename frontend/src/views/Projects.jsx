import React, { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTasks } from "@fortawesome/free-solid-svg-icons";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();

    useEffect(() => {
        getProjects();
    }, []);

    const onDeleteClick = (project) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }
        axiosClient
            .delete(`/projects/${project.id}`)
            .then(() => {
                setNotification("Project was successfully deleted");
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

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Projects</h1>
                {user.role === "manager" && (
                    <Link className="btn-add" to="/projects/new">
                        Add new
                    </Link>
                )}
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Techno</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            {user.role === "manager" && <th>Actions</th>}
                        </tr>
                    </thead>
                    {loading ? (
                        <tbody>
                            <tr>
                                <td colSpan="6" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>{project.id}</td>
                                    <td>{project.name}</td>
                                    <td>{project.description}</td>
                                    <td>{project.techno}</td>
                                    <td>{project.start_date}</td>
                                    <td>{project.end_date}</td>
                                    {user.role === "manager" && (
                                        <td>
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="btn-edit"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                />
                                            </Link>
                                            &nbsp;
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    onDeleteClick(project)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </button>
                                            &nbsp;
                                            <Link
                                                className="btn-tasks"
                                                to={
                                                    "/projects/" +
                                                    project.id +
                                                    "/tasks"
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTasks}
                                                />
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}
