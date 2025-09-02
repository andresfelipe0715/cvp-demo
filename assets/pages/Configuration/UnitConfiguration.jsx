import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import TableGeneral from "../../Components/layout/tablas/TableGeneral.jsx";
import { ModalDefault } from "../../Components/layout/modales/ModalDefault.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import SimpleSnackbar from "../../Components/SimpleSnackbar/SimpleSnackbar.jsx";
import { Close, Search } from "@mui/icons-material";
import Unit from "../../Components/BasicConfiguration/Unit.jsx";

require('../../styles/F4evaluacion/F4.css');

export function UnitConfiguration() {
    const [objeto, setObjeto] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataModal, setDataModal] = useState({});
    const [accion, setAccion] = useState('');
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
            axiosInstance.get('/document/configuration/unit/allunits', { params: { fromYear: FromYear, toYear: toYear } })
                .then(response => {
                    console.log('Data fetched:', response.data);
                    setObjeto(response.data);
                })
                .catch(error => {
                    console.error('Error fetching formats:', error);
                }).finally(() => {
                    setLoading(false);
                });
            setSearchTriggered(false);
        }
    }, [searchTriggered]);

    const handleDelete = async (unit_id) => {
        try {
            const response = await axiosInstance.delete(`/document/configuration/unit/delete/${unit_id}`);
            console.log('Delete response:', response.data);

            // Refresh the list of programs after deletion
            setObjeto((prev) => prev.filter(item => item.unit_id !== unit_id));
            handleSnackbarOpen('Unit deleted succesfully!');
        } catch (error) {
            console.error('Error deleting unit:', error);
            handleSnackbarOpen('There was an unexpected error');
        }
    };

    const modales = {
        editar: {
            titulo: ' Update unit',
            componente: <Unit type={'U'} close={() => setAccion('')} data={dataModal} onSnackbarOpen={handleSnackbarOpen} setSearchTriggered={setSearchTriggered} />
        },
        insertar: {
            titulo: 'Add unit',
            componente: <Unit type={'I'} close={() => setAccion('')} onSnackbarOpen={handleSnackbarOpen} setSearchTriggered={setSearchTriggered} />
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
                    <h1 className="f-h1">Unit Management</h1>
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
                        titulo={["Program", "Course", "Unit", "Creation Date", "Edit", "Delete"]}
                        ver={["program_name", "course_name", "unit_name", "unit_date"]}
                        accion={[
                            {
                                tipo: 'B',
                                icono: 'editar',
                                titulo: ' Editar',
                                color: 'orange',
                                funcion: (datos) => {
                                    setAccion('editar');
                                    setDataModal({
                                        id_course: datos.id_course,
                                        course_name: datos.course_name,
                                        id_program: datos.id_program,
                                        program_name: datos.program_name,
                                        unit_id: datos.unit_id,
                                        unit_name: datos.unit_name
                                    });
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
                            },
                            {
                                tipo: 'B',
                                icono: 'delete',
                                titulo: 'Delete',
                                color: 'red',
                                funcion: (datos) => {

                                    handleDelete(datos.unit_id);

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
                        tam='smallFlot'
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
