import React, { useState } from "react";
require ('../../../styles/modalDefault/modalDefault.css');
import {Box,  Modal, Paper, Typography} from "@mui/material";
export function ModalDefault({title, content, close, tam = 'bigFlot'}) {
    const [open, setOpen] = useState(true);
    return (
        <Modal open={open} onClose={() => {
            setOpen(false);
            close()
        }} className={"modalCenter"}>  
            <Paper className={tam}>

                {/*<IconButton component="span" style={style.close} onClick={() => {*/}
                {/*    setOpen(false);*/}
                {/*    close()*/}
                {/*}}>*/}
                {/*    <CloseIcon fontSize={"0.8rem"}/>*/}
                {/*</IconButton>*/}

                <Box className={"modalHeader"}>
                    <Box className={"iconLateral"}><Box/></Box>
                    <Typography component={'h3'}>{title}</Typography>
                </Box>
                <Box className={"modalContent"}>
                    {content}
                </Box>


            </Paper>
        </Modal>
    );
}