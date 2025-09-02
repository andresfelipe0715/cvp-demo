import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';
import { Autocomplete, Button, Grid, Fab, MenuItem, Box } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import { Add, Save } from "@mui/icons-material";
import LoadingAnimation from "../common/LoadingAnimation";

function Course({ type, close, data, onSnackbarOpen, setSearchTriggered, roles }) {
    console.log('this is a test', roles)
    console.log('data',data)
    const [course, setCourse] = useState([{ name: '', semester: '', credit_number: '', expert_id: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [expertIDs, setExpertIDs] = useState([]);
  

    useEffect(() => {
        axiosInstance.get('/document/configuration/program/allprograms')
            .then(response => setPrograms(response.data))
            .catch(() => setError('Error fetching programs.'));
    }, []);

    useEffect(() => {
        axiosInstance.get('/document/configuration/user/allexperts')
            .then(response => setExpertIDs(response.data))
            .catch(() => setError('Error fetching aval documents.'));
    }, [type]);

     useEffect(() => {
        
        if (data && programs.length > 0) { // Make sure programs has data
            setLoading(true);
            console.log("Fetching module by IDs", data.id_program, data.id);
            
            axiosInstance.get(`/document/configuration/course/coursebyids`, {
                params: { id_program: data.id_program, id_course: data.id }
            })
            .then(response => {
                console.log(response.data);
                const courseData = response.data;
                const matchedProgram = programs.find(prog => prog.id_programa === courseData.id_programa);
                setSelectedProgram(matchedProgram || null);
                setCourse([{ 
                    name: courseData.name_course, 
                    id: courseData.id_course, 
                    expert_id: courseData.id_expert,
                    semester: courseData.semester, 
                    credit_number: courseData.credit_number 
                }]);
            })
            .catch(() => setError('Error fetching module by ID.'))
            .finally(() => setLoading(false));
        }
    }, [data, programs]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = course.map(course => ({
                name: course.name,
                id_program: selectedProgram ? selectedProgram.id : null,
                type,
                id: type === 'U' ? course.id : undefined,
                expert_id: course.expert_id,
                semester: course.semester,
                credit_number: course.credit_number
            }));
            console.log(dataToSend)
            const response = await axiosInstance.post('/document/configuration/course/insert', { course: dataToSend });
            if (response.status === 201) {
                // If the status code is 201 (Created), it means insert was successful
                onSnackbarOpen('Module saved successfully');
                close();
                setSearchTriggered(true);
            } else if (response.status === 200) {
                // If the status code is 200 (OK), it means update was successful
                onSnackbarOpen('Module updated successfully');
                close();
                setSearchTriggered(true);
            } else {
                // For any other status code, show a generic error
                onSnackbarOpen('Error.');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Check for custom error message from the backend
                const errorMessage = error.response.data.message || 'Error saving/updated module.';
                onSnackbarOpen(errorMessage);
            } else {
                // Generic error handler for unexpected issues
                onSnackbarOpen('Error saving/update module.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangeCourse = (index, field, value) => {
        const updatedCourses = [...course];
        updatedCourses[index] = { ...updatedCourses[index], [field]: value };
        setCourse(updatedCourses);
    };

    return (
        <>
            {loading && (
                <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <LoadingAnimation />
                </div>
            )}
            <ValidatorForm onSubmit={handleSubmit}>

                <Grid>
                    <h3>COURSE MANAGEMENT</h3>

                    <Grid sx={{ width: '30%', marginTop: 2.9, my: 2 }}>
                        <Autocomplete
                            fullWidth
                            disabled={type === 'U'}
                            options={programs}
                            getOptionLabel={(option) => option.name}
                            value={selectedProgram}
                            onChange={(event, newValue) => {
                                setSelectedProgram(newValue);
                                setCourse([{ name: '', expert_id: '',  semester: '', credit_number: '' }]);
                            }}
                            renderInput={(params) => (
                                <TextValidator
                                    {...params}
                                    label="Program"
                                    variant="standard"
                                    value={selectedProgram?.name || ''}
                                    disabled={type === 'U'}
                                    validators={['required']}
                                    errorMessages={['Required']}
                                />
                            )}
                        />
                    </Grid>

                    <Grid sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {course.map((course, index) => (
                            <Grid
                                key={index}
                                container
                                spacing={2}

                            >
                                <Grid item xs={12} sm={12} md={3}>
                                    <TextValidator
                                        name={`name-${index}`}
                                        label="Insert Module"
                                        onChange={(e) => handleChangeCourse(index, 'name', e.target.value)}
                                        value={course.name}
                                        validators={['required']}
                                        errorMessages={['Required']}
                                        fullWidth
                                        inputProps={{ spellCheck: 'false', maxLength: 100 }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={12} md={2}>
                                    <TextValidator
                                        name={`semester-${index}`}
                                        label="Semester"
                                        onChange={(e) => handleChangeCourse(index, 'semester', e.target.value)}
                                        value={course.semester}
                                        validators={['matchRegexp:^[0-9]+$']}
                                        errorMessages={['Only numbers']}
                                        fullWidth
                                        inputProps={{ spellCheck: 'false', maxLength: 2 }}
                                    />
                                </Grid>


                                <Grid item xs={12} sm={12} md={2}>
                                    <TextValidator
                                        name={`credit_number-${index}`}
                                        label="Credit Number"
                                        onChange={(e) => handleChangeCourse(index, 'credit_number', e.target.value)}
                                        value={course.credit_number}
                                        validators={['matchRegexp:^[0-9]+$']}
                                        errorMessages={['Solo números']}
                                        fullWidth
                                        inputProps={{ spellCheck: 'false', maxLength: 1 }}
                                    />
                                </Grid>


                                <Grid item xs={12} sm={12} md={3}>
                                    <SelectValidator
                                        fullWidth
                                        label="Expert name"
                                        value={course.expert_id}
                                        onChange={(e) => handleChangeCourse(index, 'expert_id', e.target.value)}
                                        validators={['required']}
                                        errorMessages={['Required Field']}
                                        disabled={type === 'U' && !roles.includes('admin')}
                                        helperText={type === 'U' && !roles.includes('admin') ? "Only Admins can re select a new expert" : ""}
                                        FormHelperTextProps={{
                                            style: { color: type === 'U' && !roles.includes('admin') ? '#353535' : '' }
                                        }}
                                    >
                                        {expertIDs.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                    </SelectValidator>
                                </Grid>


                                
                            </Grid>
                        ))}
                    </Grid>



                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <Button
                            type='submit'
                            variant="contained"
                            sx={{ width: '30%', display: 'flex', backgroundColor: '#ec1c21' }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
                                <Save sx={{ mr: 2 }} />
                                <p style={{ margin: 0 }}>{loading ? 'Guardando...' : (type === 'U' ? 'UPDATE' : 'SAVE')}</p>
                            </Box>
                        </Button>
                    </Box>

                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </Grid>
            </ValidatorForm>
        </>
    );
}

export default Course;
