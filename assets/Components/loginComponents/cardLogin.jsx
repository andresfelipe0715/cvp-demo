import React, { useState } from "react";
import { Box, Button, Card, CardContent, Grid, IconButton, InputAdornment } from "@mui/material";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { AccountCircle, Password, Visibility, VisibilityOff } from "@mui/icons-material";

export function CardLogin({ formData, handleChange, submitButton }) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <Box

            className="login-card-main-container"
        >
            <Card className="card">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <ValidatorForm onSubmit={submitButton}>
                        <Grid container spacing={2} sx={{ width: '100%', marginLeft: 0 }}>
                            <Grid
                                container
                                justifyContent="center"
                                alignItems="center"
                                sx={{ mt: 2 }}
                            >

                            </Grid>

                            <Grid item xs={12} sx={{ textAlign: 'center', left: '5%' }}>
                                <h1>Sign In</h1>
                            </Grid>


                            <Grid item xs={12} sx={{ mx: 2 }}>
                                <TextValidator

                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    validators={['required']}
                                    errorMessages={['Required']}
                                    label="ID Number"
                                    variant="standard"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircle sx={{ color: 'action.active' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>


                            <Grid item xs={12} sx={{ mx: 2 }}>
                                <TextValidator
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    validators={['required']}
                                    errorMessages={['Required']}
                                    label="Password"
                                    variant="standard"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password sx={{ color: 'action.active' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 2 }} // margin bottom for spacing
                                />
                            </Grid>

                            {/* Submit Button */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    my: 2,
                                    width: '100%',
                                    mx: 2

                                }}
                            >
                                <Button
                                    type='submit'
                                    variant="contained"
                                    sx={{ width: '50%', backgroundColor: '#ec1c21', ml: 2 }}
                                >
                                    lOG IN
                                </Button>
                            </Box>
                        </Grid>
                    </ValidatorForm>
                </CardContent>
            </Card>
        </Box>
    );
}
