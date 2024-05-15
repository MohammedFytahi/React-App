import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import PropTypes from "prop-types"; // Import PropTypes

export default function UserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // State to hold the authenticated user's ID

  useEffect(() => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      axiosClient.get("/user")
        .then(({ data }) => {
          setUserId(data.id);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getUserTasks(userId);
    }
  }, [userId]);

  const getUserTasks = (userId) => {
    setLoading(true);
    axiosClient
      .get(`/users/${userId}/tasks`)
      .then(({ data }) => {
        setLoading(false);
        setTasks(data.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching user tasks:", error);
      });
  };

  return (
    <div>
      <h2>User Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
          
              <th>Name</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
              
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.start_date}</td>
                <td>{task.end_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

UserTasks.propTypes = {
  userId: PropTypes.number.isRequired,
};
