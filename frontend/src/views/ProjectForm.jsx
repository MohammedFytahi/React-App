import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setNotification } = useStateContext();
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

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/projects/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setProject(data.data);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const projectData = { ...project, user_id: user.id };
    const url = id ? `/projects/${id}` : "/projects";
    const method = id ? "put" : "post";

    axiosClient[method](url, projectData)
      .then(() => {
        const message = id ? "Project was successfully updated" : "Project was successfully created";
        setNotification(message);
        navigate("/projects");
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              {id ? <h1 className="card-title">Update Project: {project.name}</h1> : <h1 className="card-title">New Project</h1>}
            </div>
            <div className="card-body">
              {loading && <div className="text-center">Loading...</div>}
              {errors && (
                <div className="alert alert-danger">
                  {Object.keys(errors).map((key) => (
                    <p key={key}>{errors[key][0]}</p>
                  ))}
                </div>
              )}
              {!loading && (
                <form onSubmit={onSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={project.name}
                      onChange={(ev) => setProject({ ...project, name: ev.target.value })}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      className="form-control"
                      id="description"
                      value={project.description}
                      onChange={(ev) => setProject({ ...project, description: ev.target.value })}
                      placeholder="Enter description"
                      rows="3"
                    ></input>
                  </div>
                  <div className="form-group">
                    <label htmlFor="techno">Techno</label>
                    <select
                      className="form-control"
                      id="techno"
                      value={project.techno}
                      onChange={(ev) => setProject({ ...project, techno: ev.target.value.toLowerCase() })}
                      required
                    >
                      <option value="">Select Techno</option>
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="start_date">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="start_date"
                      value={project.start_date}
                      onChange={(ev) => setProject({ ...project, start_date: ev.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end_date">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="end_date"
                      value={project.end_date}
                      onChange={(ev) => setProject({ ...project, end_date: ev.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Save</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
