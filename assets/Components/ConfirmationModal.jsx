import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function ConfirmationModal({ open, onClose, onConfirm, tema }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <Box sx={{ ...style, width: 400 }}>
        <h2 id="confirmation-modal-title">Confirm deletion</h2>
        <p id="confirmation-modal-description">
          Are you sure you want to delete the item <strong>{tema}</strong>?
        </p>
        <Box container sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        </Box>
        
      </Box>
    </Modal>
  );
}

export default ConfirmationModal;
