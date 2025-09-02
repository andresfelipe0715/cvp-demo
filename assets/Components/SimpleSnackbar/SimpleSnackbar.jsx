import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarContent } from '@mui/material';

export default function SimpleSnackbar({ open, message, onClose }) {
  const determineSeverity = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('error')) {
      return 'error';
    } else if (
      lowerMessage.includes('successfully') || 
      lowerMessage.includes('successfully') || 
      lowerMessage.includes('successfully') || 
      lowerMessage.includes('successfully') || 
      lowerMessage.includes('successfully') ||
      lowerMessage.includes('successfully') ||
      lowerMessage.includes('success')
    ) {
      return 'success';
    } else if (lowerMessage.includes('warning')) {
      return 'warning';
    } else {
      return null;
    }
  };

  const severityStyles = {
    success: { backgroundColor: 'green' },
    error: { backgroundColor: 'red' },
    warning: { backgroundColor: '#edaa56' },
  };

  const severity = determineSeverity(message);
  const currentSeverityStyle = severityStyles[severity] || {};

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      sx={{
        transform: 'translate(-0.5vw, 9vh)'
      }}
    >
      <SnackbarContent
        message={message}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        style={currentSeverityStyle}
      />
    </Snackbar>
  );
}
