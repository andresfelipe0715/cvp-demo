import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CardLogin } from './Components/loginComponents/cardLogin';
import axios from 'axios';
import NavBar from './Components/layout/LoginNavBar/NavBar.jsx'
import SimpleSnackbar from './Components/SimpleSnackbar/SimpleSnackbar.jsx';
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
require('../assets/styles/login/login.css');

function Login() {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [formData, setFormData] = useState({
        password: '',
        id: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    async function submitButton(e) {
        e.preventDefault();
        console.log("Submitting:", formData);
    
        try {
            const response = await fetch('/logindata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'csrf-token': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                if (response.status === 403) {
                    handleSnackbarOpen("Error, denied access: User not authorized or inactive.");
                } else if (response.status === 404) {
                    const errorMessage = errorData.error || "Error, denied access: User doesn't exist in the system.";
                    handleSnackbarOpen(errorMessage);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || "Error, invalid credentials.";
                    console.error("Login failed:", errorMessage);
                    handleSnackbarOpen(errorMessage);
                }
                return;
            }
    
            const data = await response.json();
            
    
            if (data.token) {
                window.location.href = '/dashboard';
            } else {
                console.error("Login failed: No token received");
                alert("Login failed: No token received");
            }
        } catch (error) {
            console.error("Error general:", error.message);
            // ya que no se creo un service para identificar rutas no encontradas en el sistema
            // cualquier mensaje 404 pasa por templates/bundles/twigBundles de symfony creando un html en vez de un JSON
            // por lo que no se puede identificar el error. cabe resaltar que en el .env en dev funciona correctamente mostrando el
            // mensaje correcto cuando el usuario no existe. es decir (404)
            // verficar como se maneja en el login security el error 404
            handleSnackbarOpen("Error inesperado: Verificar los datos ingresados.");
        }
    }
    
    
    
    

    return (
        <div>
            <NavBar />
            <CardLogin 
                formData={formData} 
                handleChange={handleChange} 
                submitButton={submitButton} 
            />

            <SimpleSnackbar
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <Close fontSize="small" />
                    </IconButton>
                }/>
        </div>
    );
}

export default Login;
