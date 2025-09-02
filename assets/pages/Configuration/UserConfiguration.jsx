import React, { useState, useEffect } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import TableGeneral from "../../Components/layout/tablas/TableGeneral.jsx";
import { ModalDefault } from "../../Components/layout/modales/ModalDefault.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import Unidad from "../../Components/BasicConfiguration/Unit.jsx";
import User from "../../Components/BasicConfiguration/User.jsx";
import SimpleSnackbar from "../../Components/SimpleSnackbar/SimpleSnackbar.jsx";
import { Close } from "@mui/icons-material";

require('../../styles/F4evaluacion/F4.css');

export function UserConfiguration() {
    const [objeto, setObjeto] = useState([]);
    const [dataModal, setDataModal] = useState({});
    const [accion, setAccion] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchTrigger, setSearchTrigger] = useState(true);

    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/document/configuration/user/allusers');
            console.log('Data fetched:', response.data);
            setObjeto(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTrigger) {
            fetchAllUsers();
            setSearchTrigger(false);
        }
    }, [searchTrigger]);

    const modales = {
        editar: {
            titulo: 'Update User',
            componente: <User type={'U'} close={() => setAccion('')} data={dataModal} onSnackbarOpen={handleSnackbarOpen} setSearchTrigger={setSearchTrigger}/>
        },
        insertar: {
            titulo: 'Add User',
            componente: <User type={'I'} close={() => setAccion('')} onSnackbarOpen={handleSnackbarOpen} setSearchTrigger={setSearchTrigger}/>
        }
    };

    const close = () => {
        setAccion('');
        setDataModal({});
    };

    return (
        <>
            <Grid className="f-main">
                <div className="f-title">
                    <h1 className="f-h1">USER MANAGEMENT</h1>
                </div>

                <Box sx={{ width: '100%', overflowX: 'auto', mt: '20px', mb: '50px' }}>
                    <TableGeneral
                        datos={objeto}
                        loading={loading}
                        titulo={["Documento","Nombre","Correo electrónico", "Rol", "Editar"]}
                        ver={["documento" ,"name","email", "role_name"]}
                        accion={[
                            {
                                tipo: 'B',
                                icono: 'editar',
                                titulo: ' Editar',
                                color: 'orange',
                                funcion: (datos) => {
                                    setAccion('editar');
                                    setDataModal(datos);
                                }
                            }
                            ,
                            {
                                tipo: 'T',
                                icono: 'add',
                                titulo: ' Añadir unidad',
                                color: 'green',
                                funcion: () => {
                                    setAccion('insertar');
                                    setDataModal({}); // Reset data for adding
                                }
                            }
                        ]}
                        funciones={{ orderBy: true, search: true }}
                    />
                </Box>

                {accion !== '' ? (
                    <ModalDefault
                        title={modales[accion]["titulo"]}
                        content={modales[accion]["componente"]}
                        close={close}
                        tam='bigFlot'
                    />
                ) : null}

<SimpleSnackbar
                open={snackbarOpen}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <Close fontSize="small" />
                    </IconButton>
                }/>
            </Grid>
        </>
    );
}
