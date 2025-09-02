import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Icon,
    Box,
    TableCell,
    IconButton,
    TextField,
    TableSortLabel,
    Grid,
    TablePagination
} from "@mui/material";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { visuallyHidden } from '@mui/utils';
import '../../../styles/tabla/tabla.css';



function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box style={{ display: "flex", flexDirection: 'row' }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

const mergeJSON = (uno, dos) => {
    Object.keys(dos).map(res => {
        uno[res] = dos[res];
    });
    return uno;
}

export default function TableGeneral({
    datos,
    loading,
    titulo,
    ver,
    accion = [],
    style = { width: '100%' },
    funciones = {
        orderBy: false,
        search: false
    },
    clases1
}) {


    console.log(datos);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [row, setRow] = useState(datos);
    const [search, setSearch] = useState('');
    const [ordenar, setOrdenar] = useState({valor: true, tipo: ''});
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const orderData = (item) => {
        ordenarAsc(row, item, ordenar.valor);
        setOrdenar({ valor: !ordenar.valor, tipo: item });
    };
    const ordenarAsc = (p_array_json, prop, asc) => {
        return p_array_json.sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
    };
    const searchFunction = (valor) => {

        let arrBusqueda = valor.split(",");

        let ndata = datos.filter(item => {
            let a = arrBusqueda.map(value => {
                let c = [];
                Object.keys(item).map(res => {
                    c.push(item[res]);
                });
                return JSON.stringify(c)
                    .toUpperCase()
                    .indexOf(value.toUpperCase()) > -1 ? 1 : 0;

            }).reduce((x, y) => x + y);
            return a > 0
        });
        return ndata;
    };

    useEffect((e) => {
        if (search === '') {
            setRow(datos);
        }
    }, [row, datos])


    return (
        <TableContainer className={'tableGeneral'} style={mergeJSON({ margin: '0 auto' }, style)}>
            <Grid container spacing={0} sx={{ display: 'flex' }}>
                <Grid item className={'tableIcon'} md={8} xl={8} style={{ textAlign: 'left', padding: 0 }}>
                    {accion.map((ev, index) => {
                        if (ev.tipo === 'T') {
                            //console.log(accion);
                            //console.log(ev.titulo);
                            return (


                                <Icon key={'icon' + ev.icono} className={'icon top ' + ev.color}
                                    onClick={() => {
                                        const a = ev.funcion;
                                        a();
                                    }}>{ev.icono}</Icon>



                            );
                        }
                    })}
                </Grid>

                <Grid item sm={12} md={4} xl={4} style={{ padding: 0 }}>
                    {(funciones.search) ?
                        <TextField
                            className={'inputGeneral searchTable'}
                            label={"Search"}
                            name={"search"}
                            variant={"standard"}
                            autoComplete={'off'}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setRow((e.target.value === '') ? datos : searchFunction(e.target.value))
                            }}
                        />
                        : null}
                </Grid>
            </Grid>
            <Box>

                <Box id={'box1'} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {titulo.map((res, i) => {
                                    if (funciones.orderBy) {
                                        return (
                                            <TableCell key={res} onClick={() => {
                                                orderData(ver[i])
                                            }}>
                                                <TableSortLabel
                                                    active={ordenar.tipo === ver[i]}
                                                    direction={ordenar.valor ? 'desc' : 'asc'}
                                                >
                                                    {res}
                                                    {ordenar.tipo === ver[i] ? (
                                                        <Box component="span" sx={visuallyHidden}>
                                                            {ordenar.valor ? 'sorted descending' : 'sorted ascending'}
                                                        </Box>) : null}
                                                </TableSortLabel>
                                            </TableCell>)
                                    }
                                    return <TableCell key={res}>{res}</TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(loading) ? (
                                <TableRow>
                                    <TableCell
                                        component={"th"}
                                        colSpan={ver.length + accion.length}
                                        style={{ textAlign: 'center' }}
                                    >
                                        Loading data...
                                    </TableCell>
                                </TableRow>
                            ) : (datos.length === 0) ? (
                                <TableRow>
                                    <TableCell
                                        component={"th"}
                                        colSpan={ver.length + accion.length}
                                        style={{ textAlign: 'center' }}
                                    >
                                        No Data
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {(rowsPerPage > 0
                                ? row.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : row
                            ).map((res, i) => {
                                return (
                                    <TableRow key={'row' + i}>
                                        {ver.map(see => {
                                            return (
                                                <TableCell className={see} key={see + i}>{res[see]}</TableCell>
                                            )
                                        })}
                                        {accion.map(ev => {
                                            if (ev.tipo === 'B') {
                                                return (<TableCell className={'tableIcon'} component={"td"}
                                                    key={'evento' + i + ev.icono}>



                                                    <Icon className={'icon ' + ev.color}
                                                        onClick={() => {
                                                            const a = ev.funcion;
                                                            a(res);
                                                        }}>{ev.icono}</Icon>



                                                </TableCell>)
                                            }
                                        })}

                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        style={{ border: '1px solid #e0e0e0', borderTop: '0px' }}
                        component="div"
                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                        // colSpan={header.length}
                        count={row.length}
                        labelRowsPerPage="Rows per page."
                        labelDisplayedRows={({ from, to, count }) => to + " de " + count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                    />

                </Box>

            </Box>

        </TableContainer>
    );
}