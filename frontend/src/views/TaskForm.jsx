import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function TaskForm() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { user } = useStateContext();
  const [task, setTask] = useState({
    id: null,
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    project_id: projectId || "", 
    user_id: user.id,
  });
  const [projects, setProjects] = useState([]); 
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();


  useEffect(() => {
    axiosClient.get('/projects')
      .then(({ data }) => {
        setProjects(data.data);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  useEffect(() => {
    if (task.id) {
      setLoading(true);
      axiosClient
        .get(`/tasks/${task.id}`)
        .then(({ data }) => {
          setLoading(false);
          setTask(data);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [task.id]);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const taskData = { ...task, user_id: user.id };
    const url = task.id ? `/tasks/${task.id}` : "/tasks";
    const method = task.id ? "put" : "post";

    axiosClient[method](url, taskData)
      .then(() => {
        const message = task.id ? "Task was successfully updated" : "Task was successfully created";
        setNotification(message);
        navigate("/tasks");
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  return (
    <>
      {task.id && <h1>Update Task: {task.name}</h1>}
      {!task.id && <h1>New Task</h1>}
      <div className="card animated fadeInDown">
        {loading && <div className="text-center">Loading...</div>}
        {errors && (
          <div className="alert">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        )}
        {!loading && (
          <form onSubmit={onSubmit}>
            <input
              value={task.name}
              onChange={(ev) => setTask({ ...task, name: ev.target.value })}
              placeholder="Name"
            />
            <textarea
              value={task.description}
              onChange={(ev) => setTask({ ...task, description: ev.target.value })}
              placeholder="Description"
            />
            <input
              type="date"
              value={task.start_date}
              onChange={(ev) => setTask({ ...task, start_date: ev.target.value })}
              required
            />
            <input
              type="date"
              value={task.end_date}
              onChange={(ev) => setTask({ ...task, end_date: ev.target.value })}
              required
            />
            {/* Sélecteur de projet */}
            <select value={task.project_id} onChange={(ev) => setTask({ ...task, project_id: ev.target.value })}>
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <button className="btn">{task.id ? 'Update Task' : 'Add Task'}</button>
          </form>
        )}
      </div>
    </>
  );
}
