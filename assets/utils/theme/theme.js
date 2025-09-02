import { createTheme } from '@mui/material/styles';

// Create a custom theme
const theme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&.Mui-disabled': {
            opacity: 1,
            WebkitTextFillColor: 'rgba(0, 0, 0, 0.7)', // Corrected to camelCase
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            opacity: 1,
            WebkitTextFillColor: 'rgba(255, 0, 0, 0.7)', // Corrected to camelCase
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        docked: {
          position: 'absolute',
          right: 0,
          left: 'auto', // Removes left space and keeps it aligned on the right
        },
        paper: {
          right: 0,
          left: 'auto', // Ensures drawer appears aligned on the right side
          width: 240, // Set your desired drawer width
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#d6353a', // Set hover color
          },
        },
      },
    },
  },
});

export default theme;
