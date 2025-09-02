import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoutes } from './Components/routes/AppRoutes.jsx';
import Appbar from './Components/dashboard/AppBar.jsx';
import axios from 'axios';
import LoadingAnimation from './Components/common/LoadingAnimation.jsx';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme/theme.js';
import { Box } from '@mui/material';
import { getRoleMessage } from './utils/roleHelpers';

import { useLocation } from 'react-router-dom';


function Dashboard({ open, setOpen }) {
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userID, setUserID] = useState('');
    const [name, setName] = useState('');
    const [titulo, setTitulo] = useState('');
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';

    useEffect(() => {
        setOpen(true);
    }, []);
    useEffect(() => {
        axios.get('/dashboardrequest')
            .then(response => {
                
                if (response.data.role_names) setRoles(response.data.role_names);
                if (response.data.id) setUserID(response.data.id);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {

        if (userID) {
            axios.get(`/getUserName/${userID}`)
                .then(response => {
                    
                    if (response.data.name && response.data.title_name) {
                        setName(response.data.name);
                        setTitulo(response.data.title_name);
                    } else if (response.data.name) {
                        setName(response.data.name);
                    }
                })
                .catch(error => {
                    
                    setError(error.message);
                });
        }
    }, [userID]);


    return (
        <ThemeProvider theme={theme}>
        <div className='dashboard-main'>

            {loading ? (
                <LoadingAnimation size="25%" />
            ) : (
                <>
                    <Appbar roles={roles} userID={userID} open={open} setOpen={setOpen} />

                    {isDashboard && (
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            textAlign="center"
                            
                        >
                            <div className={`bienvenida ${open ? 'drawer-open' : 'drawer-closed'}`}>
                                <h1>Welcome, {titulo && `${titulo} `}{name}</h1>
                                <h1>{getRoleMessage(roles)}</h1> {/* Use the imported function here */}
                            </div>

                        </Box>
                    )}
                </>
            )}
            {error && <div className="error">Error: {error}</div>}
            </div>
        </ThemeProvider>
    );
}

export default Dashboard;
