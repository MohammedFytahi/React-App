import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useStateContext();
  const [project, setProject] = useState({
    id: null,
    name: "",
    description: "",
    techno: "",
    start_date: "",
    end_date: "",
    user_id: user.id, 
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/projects/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setProject(data); 
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const projectData = { ...project, user_id: user.id }; 
    if (project.id) {
      axiosClient
        .put(`/projects/${project.id}`, projectData)
        .then(() => {
          setNotification("Project was successfully updated");
          navigate("/projects");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    } else {
      axiosClient
        .post("/projects", projectData)
        .then(() => {
          setNotification("Project was successfully created");
          navigate("/projects");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    }
  };

  return (
    <>
      {project.id && <h1>Update Project: {project.name}</h1>}
      {!project.id && <h1>New Project</h1>}
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
              value={project.name}
              onChange={(ev) =>
                setProject({ ...project, name: ev.target.value })
              }
              placeholder="Name"
            />
            <input
              value={project.description}
              onChange={(ev) =>
                setProject({ ...project, description: ev.target.value })
              }
              placeholder="Description"
            />
            <select
              value={project.techno}
              onChange={(ev) =>
                setProject({ ...project, techno: ev.target.value.toLowerCase() }) // Convertir en minuscules
              }
              required
            >
              <option value="">Select Techno</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
            </select>
          
            <input type="hidden" name="user_id" value={user.id} />
            <input
              type="date"
              value={project.start_date}
              onChange={(ev) =>
                setProject({ ...project, start_date: ev.target.value })
              }
              required
            />
            <input
              type="date"
              value={project.end_date}
              onChange={(ev) =>
                setProject({ ...project, end_date: ev.target.value })
              }
              required
            />
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  );
}
