import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import { ItemsListDrawer } from '../dashboard/ItemsListDrawer.jsx';
import { ProgramConfiguration } from '../../pages/Configuration/ProgramCofiguration.jsx';
import { CourseConfiguration } from '../../pages/Configuration/CourseConfiguration.jsx';
import { UnitConfiguration } from '../../pages/Configuration/UnitConfiguration.jsx';


import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { menus } from '../routes/Menus/menusConfig';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { FirstForm } from '../../pages/FirstForm.jsx';
import { UserConfiguration } from '../../pages/Configuration/UserConfiguration.jsx';


const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

export function AppRoutes({ roles, userID, open, handleDrawerClose }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openConfigMenu, setOpenConfigMenu] = useState(false);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const availableMenus = roles.flatMap(role => menus[role] || []);
    setMenu(availableMenus);
  }, [roles]);

  const handleMenuClick = () => setOpenMenu(!openMenu);
  const handleLogout = () => console.log('logout');
  const handleConfigMenuClick = () => setOpenConfigMenu(!openConfigMenu);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MuiDrawer
  variant="persistent"
  anchor="right"
  open={open}
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-root': {
      width: 0, // Ensures no left-side spacing from the root container
    },
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      right: 0, // Aligns drawer content strictly to the right
    },
  }}
>
  <DrawerHeader>
    <IconButton onClick={handleDrawerClose}>
      <ChevronRight />
    </IconButton>
  </DrawerHeader>
  <Divider />
  <ItemsListDrawer
    menu={menu}
    openMenu={openMenu}
    handleMenuClick={handleMenuClick}
    openConfigMenu={openConfigMenu}
    handleConfigMenuClick={handleConfigMenuClick}
    handleLogout={handleLogout}
  />
</MuiDrawer>
      <Box component="main"  sx={{
          flexGrow: 1,
          p: 3,
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: 100,
          }),
          marginRight: open ? `${drawerWidth}px` : 0,
        }}>
        <Routes>
          <Route path="/document/document1" element={<FirstForm roles={roles} userID={userID}/>} />
          <Route path="/document/configuration/mprogram" element={<ProgramConfiguration roles={roles} userID={userID}/>} />
          <Route path="/document/configuration/mcourse" element={<CourseConfiguration roles={roles}/>} />
          <Route path="/document/configuration/munit" element={<UnitConfiguration roles={roles}/>} />
          <Route path="/document/configuration/muser" element={<UserConfiguration roles={roles}/>} />


     
        </Routes>
      </Box>
    </Box>
  );
}
