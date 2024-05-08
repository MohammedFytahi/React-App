import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [projectId, setProjectId] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getTasks();
    getProjects();
  }, [projectId]);

  const onDeleteClick = task => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    axiosClient.delete(`/tasks/${task.id}`)
      .then(() => {
        setNotification('Task was successfully deleted');
        getTasks();
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  const getTasks = () => {
    setLoading(true);
    const url = projectId ? `/projects/${projectId}/tasks` : '/tasks';
    axiosClient.get(url)
      .then(({ data }) => {
        setLoading(false);
        setTasks(data.data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });
  };

  const getProjects = () => {
    axiosClient.get('/projects')
      .then(({ data }) => {
        setProjects(data.data);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  };

  const handleProjectChange = (e) => {
    setProjectId(e.target.value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
        <h1>Tasks</h1>
        {user.role === 'manager' && (
          <Link className="btn-add" to="/tasks/new">Add new</Link>
        )}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="project">Filter by Project:</label>
        <select id="project" onChange={handleProjectChange} value={projectId || ""}>
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
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
              {user.role === 'manager' && (
                <th>Actions</th>
              )}
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
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.name}</td>
                  <td>{task.description}</td>
                  <td>{task.start_date}</td>
                  <td>{task.end_date}</td>
                  {user.role === 'manager' && (
                    <td>
                      <Link className="btn-edit" to={`/tasks/${task.id}`}><FontAwesomeIcon icon={faEdit} /></Link>
                      &nbsp;
                      <button className="btn-delete" onClick={() => onDeleteClick(task)}><FontAwesomeIcon icon={faTrash} /></button>
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
