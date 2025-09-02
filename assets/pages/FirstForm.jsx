import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Form from '../Components/Form/Form.jsx';
import TableGeneral from "../Components/layout/tablas/TableGeneral.jsx";
import { ModalDefault } from "../Components/layout/modales/ModalDefault.jsx";
import axios from 'axios';
import SimpleSnackbar from "../Components/SimpleSnackbar/SimpleSnackbar.jsx";
import { Close, Search } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance.js";
require('../styles/F4evaluacion/F4.css');

export function FirstForm({ roles, userID }) {
    const [objeto, setObjeto] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataModal, setDataModal] = useState([]);
    const [accion, setAccion] = useState('');
    const currentYear = new Date().getFullYear();
    const [FromYear, setFromYear] = useState(currentYear);
    const [toYear, setToYear] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);
    const yearsOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];
    useEffect(() => {
        
        setSearchTriggered(true);
    }, []);
    const handleSearch = () => {
        setSearchTriggered(true);
    };
 


    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

       const generateAndDisplayPDF = (datos) => {
        const feco_id_approved = datos.feco_id;
    
        // First request: Check if the expert approval is granted
        axiosInstance.get(`/document/firstdocument/getApprovedExpertos?feco_id=${feco_id_approved}`)
            .then(response => {
                if (!response.data.isApproved) {
                    // Second request: Generate the PDF
                    axiosInstance.post('/document/firstdocument/generatepdf', datos, {
                        headers: { 'Content-Type': 'application/json' },
                        responseType: 'blob',  // Ensure the response is a blob
                    })
                    .then(response => {
                        const blob = response.data;
                        const url = URL.createObjectURL(blob);
                        console.log(url);
                        
                        setAccion('verPDF');
                        setDataModal({ pdfUrl: url });
                    })
                    .catch(error => {
                        console.error('Error generating PDF:', error);
                        handleSnackbarOpen("Error al generar el PDF");
                    });
                } else {
                    handleSnackbarOpen("Advertencia: los dos coordinadores deben aprobar el documento.");
                }
            })
            .catch(error => {
                console.error('Error checking approval status:', error);
                handleSnackbarOpen("Error al verificar el estado de aprobación");
            });
    };
    

  
    

    useEffect(() => {
        if (searchTriggered){
            setLoading(true);
            axiosInstance.get(`/document/firstdocument/allf4formats?fromYear=${FromYear}&toYear=${toYear}`)
            .then(response => {
                console.log(response.data)
                setObjeto(response.data);
            })
            .catch(error => {
                console.error('Error fetching formats:', error);
            }).finally(() => {
                setLoading(false);
            });
            setSearchTriggered(false);
        }
        
    }, [FromYear, toYear, searchTriggered]); 
    


    const modales = {
        edit: {
            titulo: '',
            componente: <Form type={'U'} close={() => setAccion('')} data={dataModal} roles={roles} personId={userID} onSnackbarOpen={handleSnackbarOpen} setSearchTrigger={setSearchTriggered}/>
        },
        insert: {
            titulo: '',
            componente: <Form type={'I'} close={() => setAccion('')} roles={roles} personId={userID} onSnackbarOpen={handleSnackbarOpen} setSearchTrigger={setSearchTriggered}/>
        },
        verPDF: {   // <-- match what you set with setAccion
        titulo: 'PDF preview',
        componente: (
            <iframe
                src={dataModal.pdfUrl}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="PDF Preview"
            />
        ),
        close: () => {
            URL.revokeObjectURL(dataModal.pdfUrl);
            setAccion('');
        }
    }
    };

    return (
        <>
            <Grid className="f-main">
                <div className="f-title">
                    <h1 className="f-h1">DOCUMENT 1</h1>
                </div>

                
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: '20px', marginTop: '20px' }}>
                                        <Grid>
                                            <h6 style={{ marginBottom: '10px', marginTop: 0 }}>Filter by year</h6>
                                            <FormControl variant="standard" sx={{ width: 160 }}>
                                                <InputLabel id="year-select-label">From</InputLabel>
                                                <Select
                                                    labelId="year-select-label"
                                                    value={FromYear}
                                                    onChange={(e) => setFromYear(e.target.value)}
                                                    label="Del año"
                                                >
                                                    <MenuItem value="">Select a year</MenuItem>
                                                    {yearsOptions.map(year => (
                                                        <MenuItem key={year} value={year}>
                                                            {year}
                                                        </MenuItem>
                                                    ))}
                                                    <MenuItem value="">ALL</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid>
                                            <FormControl variant="standard" sx={{ width: 160, ml: '20px' }}>
                                                <InputLabel id="to-year-select-label">To (optional)</InputLabel>
                                                <Select
                                                    labelId="to-year-select-label"
                                                    value={toYear || ''}
                                                    onChange={(e) => setToYear(e.target.value)}
                                                    label="Al año (opcional)"
                                                >
                                                    <MenuItem value="">Select a year</MenuItem>
                                                    {yearsOptions.map(year => (
                                                        <MenuItem key={year} value={year}>
                                                            {year}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                    
                                        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ ml: 2, backgroundColor: '#EC1C21' }}>
                                            <Search sx={{ mr: 0.5 }} />
                                            Search
                                        </Button>
                                    </Box>


                
                <Box sx={{ width: '100%', overflowX: 'auto', mt: '20px', mb: '50px' }}>
                    <TableGeneral
                        datos={objeto}
                        loading={loading}
                        titulo={["Program ", "Course", "Date", "last modified", "Edit", "View PDF"]}
                        ver={["programa_nombre", "modulo_nombre", "fecha_entrega", "last_modified"]}
                        accion={[
                            {
                                tipo: 'B',
                                icono: 'edit',
                                titulo: ' Edit',
                                color: 'orange',
                                funcion: (datos) => {
                                    setDataModal(datos);
                                    setAccion('edit');
                                   
                                }
                            },
                            {
                                tipo: 'B',
                                icono: 'picture_as_pdf_icon', // Use an icon for PDF view
                                titulo: ' Ver PDF',
                                color: 'green',
                                funcion: (datos) => {
                                    generateAndDisplayPDF(datos);
                                }
                            },
                            ...( 
                                !roles.includes('comunicativo') 
                                    ? [{
                                        tipo: 'T',
                                        icono: 'add',
                                        titulo: 'Add',
                                        color: 'green',
                                        funcion: (datos) => {
                                            
                                            setAccion('insert');
                                        }
                                    }] 
                                    : []
                            )
                        ]}
                        funciones={{ orderBy: true, search: true }}
                    />
                </Box>

                {accion !== '' ? (
                    <ModalDefault
                        title={modales[accion]["titulo"]}
                        content={modales[accion]["componente"]}
                        close={() => {
                            setAccion('');
                            setDataModal([]);
                           
                        }}
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