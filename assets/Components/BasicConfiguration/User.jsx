import React, { useEffect, useState } from "react";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { Autocomplete, Button, Grid, Box, FormControlLabel, Switch } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import axiosInstance from "../../utils/axiosInstance";
import LoadingAnimation from "../common/LoadingAnimation";
//import data from "./data.json";

function User({ type, close, data, onSnackbarOpen, setSearchTrigger }) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(""); // State for title
    const [id, setId] = useState("");
    const [fullName, SetFullName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(""); // State for role
    const [roles, setRoles] = useState([]); // State for all roles
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState('ap');
    const [titles, setTitles] = useState([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/document/configuration/user/allroles');
                setRoles(response.data); // Set the roles in state
            } catch (error) {
                console.error('Error fetching roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles(); // Call the function to fetch roles
    }, []);

    useEffect(() => {
        if (data) {
            console.log(data)
            // Fetch the user details by id (if available)
            const fetchUserDetails = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(`/document/configuration/user/getuserbyid`, {
                        params: { id: data.id }
                    });
                    const userData = response.data;

                    console.log(userData);

                    // Set state based on the response
                    setTitle(userData.title || "");
                    setId(userData.id || "");
                    SetFullName(userData.name || "");
                    setPassword(""); // Reset password field
                    const rolesArray = JSON.parse(userData.id_roles || '[]');
                    setRole(rolesArray[0] || "");
                    setEmail(userData.email || "");
                    setStatus(userData.status || 'na');
                } catch (error) {
                    console.error('Error fetching user details:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserDetails(); // Fetch user details based on data.id
        }
    }, [data]);

    useEffect(() => {
        const fetchTitulos = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/document/configuration/user/alltitulos');
                console.log('titles', response.data);
                setTitles(response.data); // Set the roles in state
            } catch (error) {
                console.error('Error fetching roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTitulos(); // Call the function to fetch roles
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for submission
        const userData = {
            type: type,
            title,
            id,
            fullName,
            password,
            role, // Include role in the data being submitted
            email,
            status
        };

        try {
            setLoading(true);
            const response = await axiosInstance.post('/document/configuration/user/insertnewuser', userData);
            if (response.status === 201) {
                // Insert was successful (201 Created)
                console.log('User created successfully:', response.data);
                close();
                onSnackbarOpen('Usuario creado con éxito', 'success'); // Show success message
                setSearchTrigger(true);
            } else if (response.status === 200) {
                // Update was successful (200 OK)
                console.log('User updated successfully:', response.data);
                close();
                onSnackbarOpen('Usuario actualizado con éxito', 'success');
                setSearchTrigger(true);
            }


        } catch (error) {
            console.error('Error inserting user:', error);
            onSnackbarOpen('Hubo un error al crear el usuario.');
        } finally {
            setLoading(false); // Set loading state back to false after the request is completed
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
                <Grid sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', alignItems: 'baseline' }}>
                    <Grid sx={{ width: '30%', marginTop: 2.9 }}>
                        <Autocomplete
                            fullWidth
                            options={titles} // Set the options from titles state
                            getOptionLabel={(option) => option.title_name} // Display the title name
                            value={titles.find(t => t.id === title) || null}
                            onChange={(event, newValue) => {
                                setTitle(newValue ? newValue.id : null);
                            }}
                            renderInput={(params) => (
                                <TextValidator
                                    {...params}
                                    label="Title"
                                    variant="standard"
                                />
                            )}
                        />
                    </Grid>

                    <Grid sx={{ width: '30%', marginTop: 2.9 }}>
                        <Autocomplete
                            fullWidth
                            options={roles} // Use the fetched roles
                            getOptionLabel={(option) => option.name}
                            value={roles.find(roleObj => roleObj.id === role) || null}
                            onChange={(event, newValue) => {
                                setRole(newValue ? newValue.id : "");
                            }}
                            renderInput={(params) => (
                                <TextValidator
                                    {...params}
                                    label="Role"
                                    validators={['required']}
                                    errorMessages={['Required']}
                                    variant="standard"
                                    value={role}
                                />
                            )}
                        />
                    </Grid>

                    <Grid sx={{ width: '30%' }}>
                        <FormControlLabel
                            sx={{ marginTop: 6 }}
                            control={
                                <Switch
                                    checked={status === 'ap'}
                                    onChange={(e) => setStatus(e.target.checked ? 'ap' : 'na')}
                                />
                            }
                            label={status === 'ap' ? 'Activo' : 'Inactivo'}
                        />
                    </Grid>

                </Grid>
                <Grid sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Grid sx={{ width: '100%' }}>
                        <TextValidator
                            sx={{ my: 2, width: '90%' }}
                            label="ID"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            validators={['required']}
                            errorMessages={['El id es requerido']}
                            fullWidth
                            disabled={type === 'U'}
                            variant="outlined"
                            inputProps={{ spellCheck: "false", maxLength: 40 }}
                        />
                    </Grid>

                    <Grid sx={{ width: '100%' }}>
                        <TextValidator
                            sx={{ my: 2, width: '90%' }}
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            variant="outlined"
                            inputProps={{ spellCheck: "false", maxLength: 100 }}
                        />
                    </Grid>
                </Grid>
                <Grid sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Grid sx={{ width: '100%' }}>
                        <TextValidator
                            sx={{ my: 2, width: '90%' }}
                            label="Name"
                            value={fullName}
                            onChange={(e) => SetFullName(e.target.value)}
                            validators={['required']}
                            errorMessages={['El nombre es requerido']}
                            fullWidth
                            variant="outlined"
                            inputProps={{ spellCheck: "false", maxLength: 90 }}
                        />
                    </Grid>

                    <Grid sx={{ width: '100%' }}>
                        <TextValidator
                            sx={{ my: 2, width: '90%' }}
                            label="Password if the USER isn't in the LDAP"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            variant="outlined"
                            inputProps={{ spellCheck: "false", maxLength: 100 }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                    <Button
                        type='submit'
                        variant="contained"
                        sx={{ width: '26%', my: 2.4, display: 'flex', backgroundColor: '#ec1c21' }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0 }}>
                            <SaveIcon sx={{ mr: 2 }} />
                            <p style={{ margin: 0 }}>{loading ? 'Saving...' : (type === 'U' ? 'UPDATE' : 'SAVB')}</p>
                        </Box>
                    </Button>
                </Box>
            </ValidatorForm>
        </>
    );
}

export default User;
