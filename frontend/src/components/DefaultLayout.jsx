import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faFolder, faTasks, faSignOutAlt, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { AppBar, Box, Button, Container, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

const drawerWidth = 240;

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification } = useStateContext();
    const [darkMode, setDarkMode] = useState(false); 

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

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const theme = useTheme();
    const icon = darkMode ? faSun : faMoon; // Icône en fonction du mode

    const menuItems = [
        { text: 'Dashboard', icon: faTachometerAlt, path: '/dashboard' },
        { text: 'Projects', icon: faFolder, path: '/projects', role: 'manager' },
        { text: 'Users', icon: faUser, path: '/users' },
        { text: 'Tasks', icon: faTasks, path: '/tasks', role: 'manager' },
        { text: 'My tasks', icon: faTasks, path: '/usertask', role: 'collaborator' }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ marginRight: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        AXA Management System
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        <FontAwesomeIcon icon={icon} />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                        {user.name}
                    </Typography>
                    <Button color="inherit" onClick={onLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundImage: `url('images/sidebar-2.310509c9')`, 
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    },
                }}
            >
                <Toolbar />
                <Divider />
                <List>
                    {menuItems.map((item, index) => (
                        (!item.role || user.role === item.role) && (
                            <ListItem button key={index} component={Link} to={item.path}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={item.icon} />
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        )
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                <Toolbar />
                <Outlet toggleDarkMode={toggleDarkMode} /> {/* Passer la fonction de basculement du mode sombre */}
                {notification && (
                    <Box mt={2} p={2} bgcolor="info.main" color="info.contrastText" borderRadius={1}>
                        {notification}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
