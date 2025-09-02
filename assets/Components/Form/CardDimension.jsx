import React from "react";
import { Checkbox, Box, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');
const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));



export function CardDimension({ title, dimension, setDimension, id, type }) {

    const [expanded, setExpanded] = React.useState(false);
    const today = dayjs();
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    

    return (
        <>
            <Grid key={`${id}-${type}-${title}`} sx={{ width: '100%', mx: 2, marginBottom: 2 }}>


                <div className="f4-card-testttt">
                    <Card className="f4-card" >

                        <Grid sx={{ marginLeft: 2 }}>
                            <p> {title} </p>
                        </Grid>

                        <Grid className="f4-unidad-aprobacion" sx={{ mx: 2, marginBottom: 2 }}>



                            <Grid sx={{ width: '40%' }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <InputLabel id="demo-multiple-name-label">Review Date</InputLabel>
                                    <DatePicker
                                        name='reviewDate'
                                        defaultValue={dayjs()}
                                        
                                        value={dimension.reviewDate ? dayjs(dimension.reviewDate) : dayjs(today)} // Ensure value is a dayjs object or null
                                        onChange={(date) => {
                                            setDimension(prevUnidades => {
                                                const updatedUnits = [...prevUnidades];
                                                updatedUnits[id][type].reviewDate = date ? date.format('YYYY-MM-DD') : dayjs(today); // Format date or set null
                                                return updatedUnits;
                                            });
                                        }}
                                        sx={{ width: '100%' }}
                                    />


                                </LocalizationProvider>
                            </Grid>



                            <Grid sx={{ marginTop: 3.9 }} >
                                <FormControlLabel

                                    control={
                                        <Switch
                                            checked={dimension.approved === 1}
                                            onChange={(e) => {
                                                setDimension(prevUnidades => {
                                                    const updatedUnits = [...prevUnidades];
                                                    updatedUnits[id][type].approved = e.target.checked ? 1 : 0;
                                                    return updatedUnits;
                                                });
                                            }}
                                        />
                                    }
                                    label="Approved"
                                />
                            </Grid>
                        </Grid>



                        <Box sx={{ mx: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Grid sx={{ width: '100%' }}>
                                <TextValidator
                                    sx={{ width: '100%' }}
                                    id="outlined-multiline-flexible"
                                    label="Review Number"
                                    name='review'
                                    value={dimension.reviewNumber}
                                    validators={['required', 'matchRegexp:^[0-9]+$']}
                                    errorMessages={['Campo requerido', 'Solo números']}
                                    onChange={(e) => {
                                        setDimension(prevUnidades => {
                                            const updatedUnits = [...prevUnidades];
                                            updatedUnits[id][type].reviewNumber = e.target.value;
                                            return updatedUnits;
                                        });
                                    }}
                                    inputProps={{ maxLength: 2 }}
                                    multiline
                                    maxRows={4}
                                />
                            </Grid>
                        </Box>

                        <Grid sx={{ mx: 2, my: 2 }}>
                            <TextValidator


                                className='f4-observaciones'
                                id="outlined-multiline-static"
                                label="Observation"
                                multiline={true}                                
                                maxRows={10}
                                name='observation'
                                validators={['required']}
                                errorMessages={['Campo requerido']}
                                
                                value={dimension.observation}
                                onChange={(e) => {
                                    setDimension(prevUnidades => {
                                        const updatedUnits = [...prevUnidades];
                                        updatedUnits[id][type].observation = e.target.value;
                                        return updatedUnits;
                                    });
                                }}
                                inputProps={{ spellCheck: "false", maxLength: 4000 }}

                            />
                        </Grid>

                        <Grid sx={{ my: 2, mx: 2 }} >
                            <TextValidator
                                className='f4-archivosAdjuntos'

                                id="outlined-multiline-static"
                                label="Number of files"
                                multiline={true}
                                row={2}
                                name='number of files'
                                validators={['required', 'matchRegexp:^[0-9]+$']}
                                errorMessages={['Required', 'Only Numbers']}
                                value={dimension.files}
                                onChange={(e) => {
                                    setDimension(prevUnidades => {
                                        const updatedUnits = [...prevUnidades];
                                        updatedUnits[id][type].files = e.target.value;
                                        return updatedUnits;
                                    });
                                }}
                                inputProps={{ maxLength: 2 }}

                            />
                        </Grid>
                    </Card>

                </div>

            </Grid>


        </>
    );
}