import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Divider } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ExitToApp, Home } from '@mui/icons-material';
import { styled } from '@mui/material/styles';


const StyledListItemButton = styled(ListItemButton)(({ theme, isActive }) => ({
  minHeight: 48,
  justifyContent: 'center',
  px: 2.5,
  position: 'relative', // To position the bar
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: isActive ? '#d32f2f' : 'transparent', // Red if active, transparent if not
    transition: 'background-color 0.3s ease-in-out',
  },
  boxShadow: isActive ? '0px 0.5px 10px rgba(0, 0, 0, 0.1) inset' : 'none',
  transition: 'box-shadow 0.15s ease-in-out',
}));

export function ItemsListDrawer({
  menu,
  openMenu,
  handleMenuClick,
  openConfigMenu,
  handleConfigMenuClick,
  handleLogout
}) {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleInicioClick = () => {
  
    navigate('/dashboard'); // Navigate to the dashboard route
  };
  const handleLogoutClick = () => {
    handleLogout();
    window.location.href = '/';
  };

  return (
    <List>
      <ListItemButton onClick={handleInicioClick}> {/* Update this to use the new handle function */}
        <ListItemIcon sx={{ color: '#2B2B2B' }}>
          <Home />
        </ListItemIcon>
        <ListItemText primary="Home" primaryTypographyProps={{sx: {fontSize: '0.9rem', color: '#2B2B2B',fontWeight: '500',},}} />
        </ListItemButton>
      <Divider />
      {menu.map((item) => (
        <React.Fragment key={item.id}>
          <ListItemButton onClick={item.name === 'Documents' ? handleMenuClick : handleConfigMenuClick}>
            <ListItemIcon
              sx={{
                color: (item.name === 'Documents' && openMenu) || (item.name !== 'Documents' && openConfigMenu)
                  ? '#d32f2f' // Soft red for active icons
                  : '#535353', // Lighter gray for inactive icons
              }}
            >
              {item.name === 'Documents' ? <DescriptionRoundedIcon /> : <SettingsIcon />}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                sx: {
                  fontSize: '0.9rem', // Set the font size to 0.92rem
                  fontWeight: (item.name === 'Documents' && openMenu) || (item.name !== 'Documents' && openConfigMenu)
                    ? '500' // Semi-bold for active items
                    : '400', // Normal font weight for inactive items
                  color: (item.name === 'Documents' && openMenu) || (item.name !== 'Documents' && openConfigMenu)
                    ? '#000000' // Active text color
                    : '#666', // Inactive text color
                },
              }}
            />
            {(item.name === 'Documents' ? openMenu : openConfigMenu) ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={item.name === 'Documents' ? openMenu : openConfigMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenus.map((submenu) => (
                <ListItem key={submenu.url} disablePadding sx={{ display: 'block' }}>
                  <NavLink
                    to={submenu.url}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {({ isActive }) => (
                      <StyledListItemButton isActive={isActive}>
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 3,
                            justifyContent: 'center',
                            color: isActive ? '#252525' : '#868686', // Red for active icons
                          }}
                        >
                          <DescriptionRoundedIcon sx={{ marginBottom: 0.2 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={submenu.name}
                          primaryTypographyProps={{
                            sx: {
                              fontSize: '0.9rem', // Set the font size here
                              fontWeight: isActive ? '500' : '400', // Semi-bold for active items
                              color: isActive ? '#252525' : '#535353', // Adjust the color
                              whiteSpace: 'nowrap', // Prevent wrapping
                              overflow: 'hidden', // Hide the overflowed text
                              textOverflow: 'ellipsis', // Add ellipsis when text overflows
                              display: 'block', // Ensure block-level display for text
                              width: '100%',
                            },
                          }}
                        />
                      </StyledListItemButton>
                    )}
                  </NavLink>
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Divider />
        </React.Fragment>
      ))}
      
      <ListItemButton onClick={handleLogoutClick}>
        <ListItemIcon sx={{ color: '#d32f2f' }}> 
          <ExitToApp />
        </ListItemIcon>
        <ListItemText
        primary="Exit"
        primaryTypographyProps={{
          sx: {
            fontSize: '0.9rem',
            color: '#2B2B2B',
            fontWeight: '500',
          },
        }}
        />
      </ListItemButton>

    </List>
  );
}
