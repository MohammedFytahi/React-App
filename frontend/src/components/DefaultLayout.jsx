import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faFolder, faTasks, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.post("/logout").then(() => {
            setUser({});
            setToken(null);
        });
    };

    useEffect(() => {
        axiosClient.get("/user").then(({ data }) => {
            setUser(data);
        });
    }, []);

    return (
        <>
            <div id="defaultLayout">
                <aside>
                    <Link to="/dashboard" className="nav-link">
                        <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                    </Link>
                    {user.role === 'manager' && (
                        <Link to="/projects" className="nav-link">
                            <FontAwesomeIcon icon={faFolder} /> Projects
                        </Link>
                    )}
                    <Link to="/users" className="nav-link">
                        <FontAwesomeIcon icon={faUser} /> Users
                    </Link>
                    {user.role === 'manager' && (
                        <Link to="/tasks" className="nav-link">
                            <FontAwesomeIcon icon={faTasks} /> Tasks
                        </Link>
                    )}
                    {user.role === 'collaborator' && (
                        <Link to="/usertask" className="nav-link">
                            <FontAwesomeIcon icon={faTasks} /> My tasks
                        </Link>
                    )}
                </aside>
                <div className="content">
                    <header>
                        <div className="header-logo">
                            <img
                                src="images/axa.png"
                                alt="Logo"
                                className="logo-img"
                            />
                        </div>
                        <div className="header-user">{user.name}</div>
                        <div>
                            <a
                                href="#"
                                onClick={onLogout}
                                className="btn-logout"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                            </a>
                        </div>
                    </header>
                    <main>
                        <Outlet />
                    </main>
                    {notification && (
                        <div className="notification">
                            {notification}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
