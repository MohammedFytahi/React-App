// route.jsx

import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "./views/Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login.jsx";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Users from "./views/Users";
import Projects from "./views/Projects";
import UserForm from "./views/UserForm";
import ProjectForm from "./views/ProjectForm";
import Tasks from "./views/Tasks.jsx";
import TaskForm from "./views/TaskForm.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/users"/>
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/users',
        element: <Users/>
      },
      {
        path: '/projects',
        element: <Projects/>
      },
      {
        path: '/tasks',
        element: <Tasks/>
      },
      {
        path: '/tasks/new',
        element:<TaskForm key="taskCreate"/>
      },
      {
        path: '/tasks/:id',
        element:<TaskForm key="taskUpdate"/>
      },
      {
        path: '/projects/:id/tasks',
        element: <Tasks/>
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />
      },
      {
        path: '/projects/new',
        element: <ProjectForm key="projectCreate" />
      },
      {
        path: '/projects/:id',
        element: <ProjectForm key="projectUpdate" />
      },
      {
        path: '/users/:id',
        element: <UserForm key="userUpdate" />
      }
    ]
  },
  {
    path: '/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signup',
        element: <Signup/>
      },
      {
        path: '/users/as400',
        element: <Users userType="AS400" />
      },
      {
        path: '/users/web',
        element: <Users userType="WEB" />
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
]);

export default router;
