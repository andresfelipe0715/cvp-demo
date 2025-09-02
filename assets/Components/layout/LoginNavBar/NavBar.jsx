import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import LogoContainer from './LoginContainer';
require ('../../../styles/general/logocontainer.css');
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#3f3e3eff',
}));

export default function NavBar() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <LogoContainer/> 
          <Typography variant="h6" noWrap component="div" className='CVP'>
            COURSE VIRTUALIZATION PROCESS
          </Typography>
          
        </Toolbar>
      </AppBar>
    </Box>
  );
}
