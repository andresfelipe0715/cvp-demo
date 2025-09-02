import { useState, useEffect } from "react";
import { Button, Grid, Box, MenuItem, Autocomplete, createFilterOptions, Switch, FormControlLabel, FormControl } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import ConfirmationModal from "../ConfirmationModal";
import dayjs from "dayjs";
import axiosInstance from "../../utils/axiosInstance.js";
import LoadingAnimation from "../common/LoadingAnimation.jsx";
import RenderCardDimensions from './RenderCardDimensions.jsx';


function Form({ type, close, data, roles, personId, onSnackbarOpen, setSearchTrigger }) {

    
    const [loading, setLoading] = useState(false); // Track loading state
    const today = dayjs();
    const feco_id = data ? data.feco_id : null;
    const program_id = data ? data.program_id : null;
    const course_id = data ? data.course_id : null;
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [submitDate, setSubmitDate] = useState(dayjs(today));
    const [program, setProgram] = useState(data?.program_id || ''); // Ensure it's never undefined
    const [course, setCourse] = useState(data?.course_id || ''); // Ensure it's never undefined // Fixed: Initialize with data.course_id
    const [units, setUnits] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);

    const pedagogical = {
        approved: '0',
        reviewDate: today.format('YYYY-MM-DD'),
        reviewNumber: '1',
        observation: '',
        files: '0'
    };

    const comunicational = {
        approved: '0',
        reviewDate: today.format('YYYY-MM-DD'),
        reviewNumber: '1',
        observation: '',
        files: '0'
    };

    const initialItems = [{
        id: 1,
        unit: '',
        pedagogical: pedagogical,
        comunicational: comunicational,
    }];

    // Debug logging
    console.log('🔍 Debug - Current state:', {
        type,
        program,
        course,
        programsLength: programs.length,
        coursesLength: courses.length,
        unitsLength: units.length,
        isLoadingUpdateData
    });

    const [isLoadingUpdateData, setIsLoadingUpdateData] = useState(false);

    useEffect(() => {
        console.log('🔥 Program useEffect triggered:', { type, program, isLoadingUpdateData, dataProgram: data?.program_id });
        // Only reset when type is 'I' (insert mode) and not during initial data loading
        if (type === 'I' && !isLoadingUpdateData) {
            console.log('🗑️ Resetting course and form data due to program change');
            setCourse('');
            setFormData(initialItems);
            setSelectedUnits([]);
        }
    }, [program, type, isLoadingUpdateData]);

    useEffect(() => {
        console.log('🔥 Course useEffect triggered:', { type, course, isLoadingUpdateData, dataCourse: data?.course_id });
        // Only reset when type is 'I' (insert mode) and not during initial data loading
        if (type === 'I' && !isLoadingUpdateData) {
            console.log('🗑️ Resetting form data due to course change');
            setFormData(initialItems);
            setSelectedUnits([]);
        }
    }, [course, type, isLoadingUpdateData]);

    const [approvedPedagogical, setApprovedPedagogical] = useState(''); // Fixed function name
    const [approvedComunicational, setApprovedComunicational] = useState(''); // Fixed function name
    const [approvedPedagogicalBlock, setApprovedPedagogicalBlock] = useState('0'); // Fixed variable name
    const [approvedComunicationalBlock, setApprovedComunicationalBlock] = useState('0'); // Fixed variable name

    const [formData, setFormData] = useState(initialItems);

    // Separate useEffect to load form data after programs are loaded
    useEffect(() => {
        console.log('🔥 Update data useEffect triggered:', { type, programsLength: programs.length, program_id, course_id, feco_id });
        if (type !== 'U' || programs.length === 0) return;
        
        // Fetch data for updating
        setLoading(true);
        setIsLoadingUpdateData(true); // Prevent reset useEffects from firing
        console.log('📡 Fetching update data...');
        axiosInstance.get(`/document/firstdocument/updateDocument?program_id=${program_id}&course_id=${course_id}&feco_id=${feco_id}`)
            .then(response => {
                const data = response.data;
                console.log('✅ Update data received:', data);
                console.log('🔍 First item structure:', data[0]); // Let's see what fields are actually available
                
                // Assuming submitDate, program, and course are the same for all items in the response
                const fetchedFechaEntrega = data[0]?.submitDate;
                
                // Let's try different possible field names for program
                const fetchedProgram = data[0]?.id_program || data[0]?.program_id || data[0]?.id_programa || data[0]?.programa || data[0]?.program;
                
                // Let's try different possible field names for course
                const fetchedCourse = data[0]?.id_course || data[0]?.course_id || data[0]?.id_modulo || data[0]?.modulo || data[0]?.course;
                
                const fetchedPedagApproval = data[0]?.peda_approval || data[0]?.aprobacion_pedagogico;
                const fetchedComuApproval = data[0]?.comu_approval || data[0]?.aprobacion_comunicativo;

                console.log('🎯 Setting program and course:', { fetchedProgram, fetchedCourse, fetchedPedagApproval, fetchedComuApproval });

                // Transform the rest of the data into the desired format
                const organizedData = data.map(item => ({
                    id: item.feco_id, // Use feco_id as the id
                    unit: item.id_unit, // Assuming id_unidad corresponds to your "unit"
                    pedagogical: {
                        approved: parseInt(item.fedp_aprobacion, 10),
                        reviewDate: item.fedp_fecha || dayjs(),
                        reviewNumber: item.fedp_revision || null,
                        observation: item.fedp_observacion || null,
                        files: item.fedp_archivos || 0, // Example filename
                    },
                    comunicational: {
                        approved: parseInt(item.fedc_aprobacion, 10),
                        reviewDate: item.fedc_fecha || dayjs(),
                        reviewNumber: item.fedc_revision || null,
                        observation: item.fedc_observacion || null,
                        files: item.fedc_archivos || 0,
                    }
                }));
                console.log(organizedData);
                // Set the fetched data into state
                setSubmitDate(dayjs(fetchedFechaEntrega)); // Set submitDate state
                setProgram(fetchedProgram || ''); // Ensure it's never undefined
                setCourse(fetchedCourse || ''); // Ensure it's never undefined
                setFormData(organizedData); // Set organized data into formData
                setApprovedPedagogical(fetchedPedagApproval === "1" ? '1' : '0'); // Fixed function name
                setApprovedComunicational(fetchedComuApproval === "1" ? '1' : '0'); // Fixed function name
                setApprovedPedagogicalBlock(fetchedPedagApproval === "1" ? '1' : '0'); // Fixed variable name
                setApprovedComunicationalBlock(fetchedComuApproval === "1" ? '1' : '0'); // Fixed variable name
                const fetchedUnits = organizedData.map(item => item.unit);
                setSelectedUnits(fetchedUnits);
                
                // Allow resets again after a brief delay
                setTimeout(() => {
                    console.log('🔓 Clearing isLoadingUpdateData flag');
                    setIsLoadingUpdateData(false);
                }, 100);
            })
            .catch(error => {
                console.error('❌ Error fetching update data:', error);
                setIsLoadingUpdateData(false);
            }).finally(() => {
                setLoading(false);
            });
        
    }, [type, program_id, course_id, feco_id, programs]);

    const submitButton = (event) => {
        event.preventDefault();
        // Check if all fetched units are in formData
        const fetchedUnidadesIds = units.map(unit => unit.id); // IDs from fetched units
        const savedUnidadesIds = formData.map(item => item.unit); // IDs from formData

        const missingUnidades = fetchedUnidadesIds.filter(
            unidadId => !savedUnidadesIds.includes(unidadId)
        );

        if (missingUnidades.length > 0) {
            onSnackbarOpen('Warning: please save all units in the course.');
            return; // Stop submission
        }

        if (approvedPedagogical === '1') {
            const hasUnapprovedPedagogico = formData.some(item => item.pedagogical.approved !== 1);

            if (hasUnapprovedPedagogico) {
                onSnackbarOpen('Warning: All units must be approved in pedagogical dimension to continue.');
                return; // Stop submission
            }
        }

        if (approvedComunicational === '1') {
            const hasUnapprovedComunicativo = formData.some(item => item.comunicational.approved !== 1);

            if (hasUnapprovedComunicativo) {
                onSnackbarOpen('Warning: All units must be approved in comunicational dimension to continue.');
                return; // Stop submission
            }
        }
        setLoading(true); // Start loading animation

        const dataToSend = {
            feco_id: data?.feco_id,
            roles: roles,
            person_Id: personId ?? null,
            type: type,
            submitDate: submitDate.format('YYYY-MM-DD'),
            program,
            course,
            approvedPedagogical,
            approvedComunicational,
            units: formData.map(item => ({
                unit: item.unit,
                pedagogical: item.pedagogical,
                comunicational: item.comunicational
            })),
        };

        axiosInstance.post('/document/firstdocument/documentpost', dataToSend)
            .then(response => {
                const serverMessage = response.data.message || 'Successful insertion!';
                onSnackbarOpen(serverMessage);
                close();
                setSearchTrigger(true);
            })
            .catch(error => {
                if (error.response) {
                    console.error('Server error:', error.response.data);
                    const serverMessage = error.response.data.message || 'Network Problem';
                    onSnackbarOpen(serverMessage); // Display the server-provided error message
                } else {
                    onSnackbarOpen('Network Problem.');
                }
            })
            .finally(() => {
                setLoading(false); // Stop loading animation after request completes
            });
    };

    const agregarUnidad = () => {
        const maxId = formData.length > 0 ? Math.max(...formData.map(boxUnit => boxUnit.id)) : 0;
        const newId = maxId + 1;

        const newUnidad = {
            id: newId,
            unit: '',
            pedagogical: {
                approved: '',
                reviewDate: today.format('YYYY-MM-DD'),
                reviewNumber: '1',
                observation: '',
                files: '0'
            },
            comunicational: {
                approved: '',
                reviewDate: today.format('YYYY-MM-DD'),
                reviewNumber: '1',
                observation: '',
                files: '0'
            }
        };

        setFormData([...formData, newUnidad]);
    }

    const handleDeleteClick = (boxUnit) => {
        setUnitToDelete(boxUnit); // Fixed: Store the whole boxUnit object like Spanish version
        setOpenModal(true);
    };

    const deleteUnitConfirmation = () => {
        const updatedFormData = formData.filter(boxUnit => boxUnit.unit !== unitToDelete.unit); // Fixed: Compare by unit like Spanish version
        setFormData([...updatedFormData]);
        console.log(formData); // Check updated formData
        setOpenModal(false);
    };

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await axiosInstance.get('/document/configuration/program/allprograms');
                setPrograms(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching programs:', error);
                // setError('Error fetching programs.'); // Remove this line or define setError
            }
        };

        fetchPrograms();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            if (program) { // Only fetch if program has a value
                try {
                    const response = await axiosInstance.get(`/document/configuration/course/selectcoursesbyprogram/${program}`);
                    setCourses(response.data); // Ensure this returns the expected structure
                    console.log('Fetched Courses:', response.data); // Log the fetched courses
                } catch (error) {
                    console.error('Error fetching courses:', error);
                    // setError('Error fetching courses.'); // Remove this line or define setError
                }
            } else {
                setCourses([]); // Clear courses if program is not set
            }
        };

        fetchCourses();
    }, [program]);

    // Load courses when component mounts if program is already set (for update mode)
    useEffect(() => {
        if (type === 'U' && program && courses.length === 0) {
            const fetchCourses = async () => {
                try {
                    const response = await axiosInstance.get(`/document/configuration/course/selectcoursesbyprogram/${program}`);
                    setCourses(response.data);
                    console.log('Fetched Courses for update mode:', response.data);
                } catch (error) {
                    console.error('Error fetching courses for update mode:', error);
                }
            };
            fetchCourses();
        }
    }, [type, program, courses.length]);

    useEffect(() => {
        const fetchUnidades = async () => {
            if (course) { // Only fetch if course has a value
                try {
                    const response = await axiosInstance.get(`/document/configuration/unit/selectunitsbycourse/${course}`);
                    setUnits(response.data); // Set the fetched units
                    console.log('Fetched Units:', response.data); // Log the fetched units
                } catch (error) {
                    console.error('Error fetching units:', error);
                    // setError('Error fetching units.'); // Remove this line or define setError
                }
            } else {
                // Only clear units if we're not loading update data
                if (!isLoadingUpdateData) {
                    setUnits([]); // Clear units if course is not set
                }
            }
        };

        fetchUnidades();
    }, [course, isLoadingUpdateData]);

    console.log('FormData IDs:', formData.map(item => item.id));

    return (
        <>
            <div className="f-title">
                <h1 className="f-h1">
                    Document No.1
                </h1>
            </div>
            <ValidatorForm onSubmit={submitButton}>
                {loading && (
                    <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <LoadingAnimation /> {/* Use your custom LoadingAnimation component */}
                    </div>
                )}

                <Grid
                    container
                    spacing={2}
                    sx={{ width: '100%', marginBottom: 3, marginTop: 2 }}
                >
                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label='Submission Date'
                                name='submitDate'
                                value={submitDate}
                                onChange={(selectedDate) => setSubmitDate(selectedDate)}
                                sx={{
                                    width: '100%',
                                    backgroundColor: 'white',
                                    '& .MuiInputBase-root': { paddingTop: 0 }, // Align the input field
                                }}
                                defaultValue={today}
                                disabled
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SelectValidator
                            sx={{ backgroundColor: 'white' }}
                            className='selector'
                            id="program-select"
                            label="Program"
                            validators={['required']}
                            errorMessages={['Required field']}
                            disabled={type === 'U'}
                            value={program || ''} // Ensure it's never undefined
                            onChange={(e) => {
                                console.log('📝 Program changed to:', e.target.value);
                                setProgram(e.target.value);
                            }}
                        >
                            <MenuItem value=""><em>Select program</em></MenuItem>
                            {programs.map((prog) => (
                                <MenuItem key={prog.id} value={prog.id}>
                                    {prog.name}
                                </MenuItem>
                            ))}
                        </SelectValidator>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SelectValidator
                            sx={{ backgroundColor: 'white' }}
                            className='selector'
                            id="course-select"
                            label="Course"
                            disabled={!program || type === 'U'}
                            validators={['required']}
                            errorMessages={['Required field']}
                            value={course || ''} // Ensure it's never undefined
                            onChange={(e) => {
                                console.log('📝 Course changed to:', e.target.value);
                                setCourse(e.target.value);
                            }}
                        >
                            <MenuItem value=""><em>Select a course</em></MenuItem>
                            {courses.map((mod) => (
                                <MenuItem key={mod.id_course} value={mod.id_course}>
                                    {mod.name_course}
                                </MenuItem>
                            ))}
                        </SelectValidator>
                    </Grid>
                </Grid>
                {formData.map((boxUnit, index) => (
                    <Grid key={`${boxUnit.id}-${index}`} sx={{ my: 2, border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '10px', width: '100%', backgroundColor: '229, 229, 229', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Grid sx={{ width: '100%', mx: 2 }}>
                            {type !== 'U' && (!units.find(u => u.id === boxUnit.unit)) && (
                                <div className="f4-fab">
                                    <Fab
                                        size="small"
                                        color="primary"
                                        aria-label="remove"
                                        sx={{ right: 0, marginRight: 4.5, marginTop: -2.5, backgroundColor: 'red' }}
                                        onClick={() => handleDeleteClick(boxUnit)}
                                    >
                                        <RemoveIcon />
                                    </Fab>
                                </div>
                            )}
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ mt: 4, my: 2, paddingRight: 2, width: '30%' }}>
                                <Autocomplete
                                    fullWidth
                                    disabled={!course || boxUnit.unit}
                                    id={`n_s-${index}`} // Unique ID for each Autocomplete
                                    filterOptions={createFilterOptions({ limit: 25 })}
                                    options={units.filter(u => !selectedUnits.includes(u.id))} // Filter out already selected units
                                    getOptionLabel={(option) => option.name}
                                    value={boxUnit.unit ? units.find(u => u.id === boxUnit.unit) || null : null}
                                    isOptionEqualToValue={(option, value) => { return true; }}
                                    onChange={(e, newValue) => {
                                        const updatedBoxUnits = [...formData];
                                        updatedBoxUnits[index] = {
                                            ...updatedBoxUnits[index],
                                            unit: newValue ? newValue.id : null
                                        };

                                        // Update selected units state
                                        if (newValue) {
                                            setSelectedUnits(prev => [...prev, newValue.id]); // Add selected unit
                                        } else {
                                            setSelectedUnits(prev => prev.filter(id => id !== boxUnit.unit)); // Remove unit if unselected
                                        }

                                        setFormData(updatedBoxUnits);
                                    }}
                                    renderInput={(params) => {
                                        const selectedUnit = boxUnit.unit ? units.find(u => u.id === boxUnit.unit) : null;

                                        return (
                                            <TextValidator
                                                {...params}
                                                label="Unit"
                                                variant="standard"
                                                value={selectedUnit ? selectedUnit.name : ''}
                                                validators={['required']}
                                                errorMessages={['Required field']}
                                            />
                                        );
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <div className="f4-card-dimension">
                            <RenderCardDimensions
                                roles={roles}
                                boxUnit={boxUnit}
                                index={index}
                                setFormData={setFormData}
                            />
                        </div>
                    </Grid>
                ))}

                {type !== 'U' && (
                    <Grid className="f4-agregar-unidad">
                        <Button variant="contained" sx={{ width: '26%', backgroundColor: '#ec1c21' }} onClick={agregarUnidad}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
                                <AddIcon sx={{ mr: 2 }} />
                                <p style={{ margin: 0 }}>Add unit</p>
                            </Box>
                        </Button>
                    </Grid>
                )}

                <Grid sx={{ marginTop: 3.9, display: 'flex', justifyContent: 'space-between', width: '100%', paddingLeft: 4, paddingRight: 4 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={approvedPedagogical === '1'}
                                onChange={(e) => setApprovedPedagogical(e.target.checked ? '1' : '0')} // Fixed function name
                                disabled={!roles.includes('pedagogical')}
                            />
                        }
                        label="Pedagogical Approval"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={approvedComunicational === '1'}
                                onChange={(e) => setApprovedComunicational(e.target.checked ? '1' : '0')} // Fixed function name
                                disabled={!roles.includes('comunicational')}
                            />
                        }
                        label="Comunicational Approval"
                    />
                </Grid>
                {console.log(approvedComunicationalBlock, approvedPedagogicalBlock)} {/* Fixed variable names */}
                <Grid item md={12} xl={12}
                    sx={{ display: 'flex', justifyContent: 'center', mt: '25px', mb: '25px', paddingBottom: '25px' }}>
                    {!(approvedPedagogicalBlock === '1' && approvedComunicationalBlock === '1') && ( // Fixed variable names
                        <Button type='submit' sx={{ backgroundColor: '#ec1c21', color: 'white', ":hover": { backgroundColor: '#ec1d21' } }}> 
                            <SaveIcon sx={{ mr: 2 }} />
                            {(type === 'U') ? 'Update' : (type === 'D') ? 'Delete' : 'Save'} 
                        </Button>
                    )}
                </Grid>

                <ConfirmationModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onConfirm={deleteUnitConfirmation}
                    tema={unitToDelete ? unitToDelete.unit : ''}
                />
            </ValidatorForm>
        </>
    )
}

export default Form;