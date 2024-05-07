import {Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios-client";

export default function DefaultLayout(){
const {user, token, setUser, setToken}=useStateContext()

if(!token){
    return <Navigate to="/login"/>
}
const onLogout = (ev)=>{
    ev.preventDefault()
    axiosClient.post('/logout')
    .then(()=>{
        setUser({})
        setToken(null)
    })
}

useEffect(()=>{
    axiosClient.get('/user')
    .then(({data})=>{
        setUser(data)
    })
},[])

    return(
        <>
        <div id="defaultLayout">
            <aside>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/users">Users</Link>
            </aside>
            <div className="content">
                <header>
                    <div>
                        header
                        <a href="#" onClick={onLogout} className="btn-logout">Logout</a>
                    </div>
                    <div>
                        {user.name}
                    </div>
                </header>
                <main>
                <Outlet/>
                </main>
            </div>
        
        </div>
        </>
    )
}