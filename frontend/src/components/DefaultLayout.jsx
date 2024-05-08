import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faFolder, faTasks ,faSignOutAlt} from '@fortawesome/free-solid-svg-icons'; 



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
                <Link to="/dashboard" style={{ marginTop: '50px' }}>
    <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
</Link>
{user.role === 'manager' && (
                <Link to="/projects">
                    <FontAwesomeIcon icon={faFolder} /> Projects
                </Link>
)}
                <Link to="/users">
                    <FontAwesomeIcon icon={faUser} /> Users
                </Link>
                <Link to="/tasks">
                    <FontAwesomeIcon icon={faTasks} /> Tasks
                </Link>
                </aside>
                <div className="content">
                    <header>
                        <div>
                            <img
                                src="images/axa.png"
                                alt=""
                                style={{ width: 100 }}
                            ></img>
                        </div>
                        <div>{user.name}</div>
                        <div>
                            <a
                                href="#"
                                style={{
                                    backgroundColor: "red",
                                    transition: "transform 0.2s",
                                    display: "inline-block",
                                }}
                                onClick={onLogout}
                                className="btn-logout"
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} />  Logout
                            </a>
                        </div>
                    </header>
                    <main>
                        <Outlet />
                    </main>
                    {notification &&
          <div className="notification">
            {notification}
          </div>
        }
                </div>
            </div>
        </>
    );
}
