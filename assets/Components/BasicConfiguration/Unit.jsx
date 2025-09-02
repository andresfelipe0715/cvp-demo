import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { Autocomplete, Button, Grid, Fab, Box } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import { Add, Save } from "@mui/icons-material";
import LoadingAnimation from "../common/LoadingAnimation";

function Unit({ type, close, data, onSnackbarOpen, setSearchTriggered }) {
    console.log(data);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [units, setUnits] = useState([]);
    const [errors, setErrors] = useState({ program: false, course: false, unit: false });

    // Set initial state from data if type === U
    useEffect(() => {
        if (type === 'U' && data) {

            setLoading(true);
            const fetchUnidadData = async () => {
                try {
                    const response = await axiosInstance.get('/formato/configuration/unit/getunidadbyids', {
                        params: {
                            id_programa: data.id_programa,
                            id_modulo: data.id_modulo,
                            id_unidad: data.id_unidad
                        }
                    });

                    // Assuming the response contains the necessary data for setting the state
                    const unidadData = response.data;
                    if (unidadData) {
                        setSelectedProgram({
                            id_programa: unidadData.id_programa,
                            name: unidadData.programa_nombre
                        });
                        setSelectedCourse({
                            id_modulo: unidadData.id_modulo,
                            modulo_nombre: unidadData.modulo_nombre
                        });
                        setUnits([{ name: unidadData.unidad_nombre }]); // Assuming one unit for update
                    }

                } catch (error) {
                    console.error('Error fetching unit data:', error);
                    setError('Error fetching unit data.');
                } finally {
                    setLoading(false);
                }
            };

            fetchUnidadData();
        }

    }, [type, data]);

    // Fetch all programs
    useEffect(() => {
        axiosInstance.get('/document/configuration/program/allprograms')
            .then(response => {
                console.log(response);
                setPrograms(response.data);
            })
            .catch(() => setError('Error fetching programs.'));

    }, []);


    // Fetch courses based on the selected program
    useEffect(() => {
        if (selectedProgram) {
            const fetchCourses = async () => {
                try {
                    const response = await axiosInstance.get(`/document/configuration/course/selectcoursesbyprogram/${selectedProgram.id}`);
                    setCourses(response.data);
                } catch (error) {
                    console.error('Error fetching modules:', error);
                    setError('Error fetching modules.');
                }
            };

            fetchCourses();
        }
    }, [selectedProgram]);

    const handleAddUnidad = () => {
        if (units.length < 4) { // Limit to 4
            setUnits([...units, { name: '' }]);
        }
    };

    const handleDeleteUnidad = (index) => {
        setUnits(units.filter((_, i) => i !== index));
    };

    const handleUnidadChange = (index, value) => {
        const updatedUnidades = [...units];
        updatedUnidades[index].name = value;
        setUnits(updatedUnidades);
    };

    const validateFields = () => {
        const newErrors = { program: !selectedProgram, course: !selectedCourse, unit: units.length === 0 };
        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateFields()) {
            setLoading(false);
            onSnackbarOpen('Warning: Please fill all the fields.');
            return;
        }

        try {
            // Prepare data to send
            const dataToSend = {
                program: selectedProgram,
                course: selectedCourse,
                units: units.map((unit, index) => ({
                    ...unit,
                    unit_id: type === 'U' ? data.id_unidad : undefined
                })),
                type: type
            };

            console.log('Data to send:', dataToSend);
            const response = await axiosInstance.post('/document/configuration/unit/insert', dataToSend);
            console.log('Response from submission:', response.data);
            if (response.data.status === 'success') {
                const successMessage = type === 'I'
                    ? 'Unit added successfully'
                    : 'Unit updated successfully';

                // Show success message in snackbar
                onSnackbarOpen(successMessage);
                close();
                setSearchTriggered(true);
            } else {
                // Handle error if status is not 'success'
                onSnackbarOpen('There was a problem saving/updating the Unit.');
            }

        } catch (error) {
            console.error('Error submitting form:', error);

            if (error.response && error.response.status === 400) {
                // Check for custom error message from the backend
                const errorMessage = error.response.data.message || 'There was a problem saving/updating the Unit.';
                onSnackbarOpen(errorMessage);
            } else {
                // Generic error handler for unexpected issues
                onSnackbarOpen('There was a problem saving/updating the Unit.');
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <>


            <ValidatorForm onSubmit={handleSubmit}>
                {loading && (
                    <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <LoadingAnimation />
                    </div>
                )}
                <Grid sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3>Unit Management</h3>
                    <Grid sx={{ width: '100%' }}>
                        <Grid sx={{ width: '75%', marginTop: 2.9, my: 2 }}>
                            <Autocomplete
                                fullWidth
                                disabled={type === 'U'}
                                options={programs}
                                getOptionLabel={(option) => option.name || ""}
                                value={selectedProgram}
                                onChange={(event, newValue) => {
                                    setSelectedProgram(newValue);
                                    setSelectedCourse(null);
                                    setErrors(prev => ({ ...prev, program: false }));
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextValidator
                                        {...params}
                                        label="Program"
                                        variant="standard"
                                        error={errors.program}
                                        helperText={errors.program ? 'Campo requerido' : ''}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    <Grid sx={{ width: '100%' }}>
                        <Grid sx={{ width: '75%', marginTop: 2.9, my: 2 }}>
                            <Autocomplete
                                fullWidth
                                options={courses}
                                getOptionLabel={(option) => option.name_course}
                                value={selectedCourse}
                                onChange={(event, newValue) => {
                                    setSelectedCourse(newValue);
                                    setErrors(prev => ({ ...prev, course: false }));
                                }}
                                isOptionEqualToValue={(option, value) => option.id_course === value.id_course}
                                renderInput={(params) => (
                                    <TextValidator
                                        {...params}
                                        label="Course"
                                        disabled={type === 'U'}
                                        variant="standard"
                                        error={errors.course}
                                        helperText={errors.course ? 'Required Field' : ''}
                                    />
                                )}
                                disabled={!selectedProgram || type === 'U'}
                            />
                        </Grid>
                    </Grid>
                    <Grid sx={{ width: '100%' }}>
                        <Grid sx={{ width: '75%', marginTop: 2.9, my: 2 }}>
                            {units.length > 0 && (
                                <Grid style={{ marginTop: '20px', width: '100%' }}>
                                    <h3>Units:</h3>
                                    {units.map((unit, index) => (
                                        <Grid key={index} style={{ marginBottom: '10px', display: 'flex' }}>
                                            <TextValidator
                                                name={`unit-${index}`}
                                                label={`Unit ${index + 1}`}
                                                value={unit.name}
                                                onChange={(e) => handleUnidadChange(index, e.target.value)} // Allowing changes
                                                validators={['required']}
                                                errorMessages={['Campo requerido']}
                                                style={{ flexGrow: 1 }}
                                                inputProps={{ spellCheck: "false", maxLength: 80 }}
                                            />
                                            {type !== 'U' && (
                                                <Fab
                                                    size="small"
                                                    color="primary"
                                                    aria-label="remove"
                                                    sx={{ marginLeft: 1, backgroundColor: 'red', marginTop: 1 }}
                                                    onClick={() => handleDeleteUnidad(index)}
                                                >
                                                    <RemoveIcon />
                                                </Fab>
                                            )}
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>



                    {type !== 'U' && (
                        <Grid style={{ marginTop: 16 }}>
                            <Button
                                variant="contained"

                                onClick={handleAddUnidad}
                                style={{ marginTop: 16, backgroundColor: '#ec1c21' }}
                            >
                                <Add sx={{ mr: 2 }} />
                                Add Unit
                            </Button>
                        </Grid>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3, width: '100%' }}>
                        <Button
                            type='submit'
                            variant="contained"
                            sx={{ width: 'auto', display: 'flex', backgroundColor: '#ec1c21' }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Save sx={{ mr: 2 }} />
                                <p style={{ margin: 0 }}>{loading ? 'Saving...' : (type === 'U' ? 'UPDATE' : 'SAVE')}</p>
                            </Box>
                        </Button>
                    </Box>

                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </Grid>
            </ValidatorForm>
        </>
    );
}

export default Unit;
