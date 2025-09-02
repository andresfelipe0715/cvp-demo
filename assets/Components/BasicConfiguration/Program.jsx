import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { Save } from "@mui/icons-material";
import LoadingAnimation from "../common/LoadingAnimation";

function Program({ type, close, data, onSnackbarOpen, setSearchTriggered }) {
    const [name, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [idProgram, setIdProgram] = useState(null);
    const [error, setError] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axiosInstance.get('/document/configuration/program/allfaculties');
                setFaculties(response.data);
                
            } catch (err) {
                console.error("Error fetching faculties:", err);
            }
        };
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (data && data.id_program) {
            const fetchProgramaById = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`/document/configuration/program/programbyid/${data.id_program}`);
                    const programaData = response.data;
                    setNombre(programaData.name);
                    setIdProgram(programaData.id);
                    setSelectedFaculty(faculties.find(fac => fac.id_faculty === programaData.id_faculty) || null);
                } catch (err) {
                    console.error("Error fetching programa by ID:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProgramaById();
        }
    }, [data, faculties]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            setLoading(true);
            const response = await axiosInstance.post('/document/configuration/program/insert', {
                name,
                type,
                id_program: idProgram,
                id_faculty: selectedFaculty ? selectedFaculty.id_faculty : null
            });
            console.log('Response:', response.data);
            if (response.data.status === 'success') {
                const successMessage = type === 'I' 
                    ? 'Program inserted successfully' 
                    : 'Program updated successfully';
    
                // Show success message in the snackbar
                onSnackbarOpen(successMessage);
    
                
                close();
                setNombre('');
            } else {
                // Handle unexpected status or error message from the backend
                onSnackbarOpen('Error. ' + (response.data.message || ''));
            }
            
        } catch (err) {
            console.error('Error:', err);
            // Check if the error has a response and extract the message
        if (err.response) {
            // Check for specific error code or message from the backend
            const errorMessage = err.response.data || 'Unknown Error';

            // Show the error message returned from the backend
            onSnackbarOpen('Error: ' + errorMessage);
        } else if (err.request) {
            // The request was made, but no response was received
            onSnackbarOpen('Network Error. Could not Connect to the Server.');
        } else {
            // Something else went wrong
            onSnackbarOpen('Error: ' + err.message);
        }
        } finally {
            setLoading(false);
            setSearchTriggered(true);
        }
    };

    return (
        <>
        
            <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
            <ValidatorForm onSubmit={handleSubmit} style={{ width: '100%' }}>
            {loading && (
                    <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <LoadingAnimation />
                    </div>
                )}
                <h3>Program Management</h3>
                <Grid container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }} spacing={2}>
                    <Grid item xs={12} sm={6} md={7}>
                        <TextValidator
                            name="name"
                            fullWidth
                            label="Insert Program Name"
                            onChange={(e) => setNombre(e.target.value)}
                            value={name}
                            validators={['required']}
                            errorMessages={['Campo requerido']}
                            inputProps={{ spellCheck: "false", maxLength: 120 }}
                            
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={5} style={{ marginTop: '20px' }}>
                        <Autocomplete
                            options={faculties}
                            getOptionLabel={(option) => option.name}
                            value={selectedFaculty}
                            onChange={(event, newValue) => setSelectedFaculty(newValue)}
                            renderInput={(params) => (
                                <TextValidator
                                    {...params}
                                    label="Seleccione la facultad"
                                    
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid>
                </Grid>


                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <Button
                            type='submit'
                            variant="contained"
                            sx={{ width: '50%', display: 'flex', backgroundColor: '#ec1c21' }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
                                <Save sx={{ mr: 2 }} />
                                <p style={{ margin: 0 }}>{loading ? 'Saving...' : (type === 'U' ? 'UPDATE' : 'SAVE')}</p>
                            </Box>
                        </Button>
                    </Box>

                {error && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
                )}
            </ValidatorForm>
            </Grid>
        </>
    );
}

export default Program;
