import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { AppRoutes } from '../routes/AppRoutes';
import LogoContainer from '../layout/LoginNavBar/LoginContainer';
require ('../../styles/general/logocontainer.css');


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: 120,
  }),
  ...(open && {
    marginRight: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: 120,
    }),
  }),
}));

export default function Appbar({ roles, userID, open, setOpen }) {
  const theme = useTheme();
  

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <Box
      sx={{ display: 'flex' }}
      className={`f-main ${open ? 'drawer-open' : 'drawer-closed'}`} // Add conditional class
    >
      <AppBar position="fixed" open={open} sx={{ backgroundColor: '#3f3e3eff' }}>
        
        <Toolbar>
          <LogoContainer/>
          <Typography variant="h6" noWrap component="div" className='CVP'>
            COURSE VIRTUALIZATION PROCESS
          </Typography>
          
          {/* Move the IconButton to the far right */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="end"
            sx={{ ml: 'auto', ...(open && { display: 'none' }) }} // Pushes icon all the way to the right
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <AppRoutes roles={roles} userID={userID} open={open} handleDrawerClose={handleDrawerClose} />
    </Box>
  );
}
