import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import Course from "../../Components/BasicConfiguration/Course.jsx";
import TableGeneral from "../../Components/layout/tablas/TableGeneral.jsx";
import { ModalDefault } from "../../Components/layout/modales/ModalDefault.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import SimpleSnackbar from "../../Components/SimpleSnackbar/SimpleSnackbar.jsx";
import { Close, Search } from "@mui/icons-material";

require('../../styles/F4evaluacion/F4.css');

export function CourseConfiguration({ roles }) {

    const [object, setObject] = useState([]);
    const [dataModal, setDataModal] = useState({});
    const [action, setAction] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
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


    const handleSnackbarOpen = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (searchTriggered) {
            setLoading(true);
            axiosInstance.get('/document/configuration/course/allcourses', { params: { fromYear: FromYear, toYear: toYear } })
                .then(response => {
                    console.log('Data fetched:', response.data);
                    setObject(response.data);
                })
                .catch(error => {
                    console.error('Error fetching formats:', error);
                }).finally(() => {
                    setLoading(false);
                });
            setSearchTriggered(false);
        }
    }, [searchTriggered]);

    const handleDelete = async (id) => {
        try {
            const response = await axiosInstance.delete(`/document/configuration/course/delete/${id}`);
            console.log('Delete response:', response.data);

            // Refresh the list of programs after deletion
            setObject((prev) => prev.filter(item => item.id_course !== id));

            handleSnackbarOpen('course deleted successfully!');
        } catch (error) {
            console.error('Error deleting course:', error);
            handleSnackbarOpen('Error deleting course');

        }
    };

    const modales = {
        editar: {
            titulo: 'Update Course',
            componente: <Course type={'U'} close={() => setAction('')} data={dataModal} onSnackbarOpen={handleSnackbarOpen} setSearchTriggered={setSearchTriggered} roles={roles} />
        },
        insertar: {
            titulo: 'Create Course',
            componente: <Course type={'I'} close={() => setAction('')} onSnackbarOpen={handleSnackbarOpen} setSearchTriggered={setSearchTriggered} roles={roles} />
        }
    };

    const close = () => {
        setAction('');
        setDataModal({});
    };

    return (
        <>
            <Grid className="f-main">
                <div className="f-title">
                    <h1 className="f-h1">COURSE MANAGEMENT</h1>
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
                        datos={object}
                        loading={loading}
                        titulo={["Program", "Course", "Date", "Edit", "Delete"]}
                        ver={["program_name", "course_name", "date"]}
                        accion={[
                            {
                                tipo: 'B',
                                icono: 'edit',
                                titulo: ' Editar',
                                color: 'orange',
                                funcion: (datos) => {
                                    setAction('editar');
                                    setDataModal({
                                        id: datos.id_course,
                                        name: datos.course_name,
                                        id_program: datos.id_program,
                                        name_program: datos.program_name,
                                        name_expert: datos.name_expert,
                                        id_expert: datos.id_expert,
                                        semester: datos.semester,
                                        credit_number: datos.credit_number
                                    });
                                }
                            }
                            ,
                            {
                                tipo: 'T',
                                icono: 'add',
                                titulo: ' Añadir modulo',
                                color: 'green',
                                funcion: () => {
                                    setAction('insertar');
                                    setDataModal({}); // Reset data for adding
                                }
                            },
                            {
                                tipo: 'B',
                                icono: 'delete',
                                titulo: 'Delete',
                                color: 'red',
                                funcion: (datos) => {

                                    handleDelete(datos.id_course);

                                }
                            }
                        ]}
                        funciones={{ orderBy: true, search: true }}
                    />
                </Box>

                {action !== '' ? (
                    <ModalDefault
                        title={modales[action]["titulo"]}
                        content={modales[action]["componente"]}
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
                    } />
            </Grid>
        </>
    );
}
