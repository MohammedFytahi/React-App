import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Users({ userType }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers(userType);
  }, [userType]);

  const onDeleteClick = (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    axiosClient
      .delete(`/users/${user.id}`)
      .then(() => {
        setNotification("User was successfully deleted");
        getUsers(userType);
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const getUsers = (userType) => {
    setLoading(true);
    let url = "/users";
    if (userType) {
      url += `/${userType}`;
    }
    axiosClient
      .get(url)
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching users:", error);
      });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Users</h1>
        {user.role === "manager" && <Link className="btn-add" to="/users/new">Add new</Link>}
      </div>
      <div>
        <div>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="button-90" onClick={() => getUsers()}>All</button>
          <button className="button-90" onClick={() => getUsers("AS400")}>AS400</button>
          <button className="button-90" onClick={() => getUsers("WEB")}>WEB</button>
        </div>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Create Date</th>
              {user.role === "manager" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.created_at}</td>
                  {user.role === "manager" && (
                    <td>
                      <Link className="btn-edit" to={"/users/" + u.id}>
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      &nbsp;
                      <button className="btn-delete" onClick={(ev) => onDeleteClick(u)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
