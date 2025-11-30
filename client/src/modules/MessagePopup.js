import { Snackbar, Slide } from "@mui/material"; // Updated import for MUI v5
import MuiAlert from "@mui/material/Alert"; // Updated import for MUI v5

const Alert = MuiAlert;

const MessagePopup = (props) => {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    props.setOpen(false);
  };

  return (
    <Snackbar
      open={props.open}
      autoHideDuration={2000}
      onClose={handleClose}
      TransitionComponent={Slide} // Optional: Slide transition, you can remove or replace with other transitions if needed
    >
      <Alert onClose={handleClose} severity={props.severity}>
        {props.message}
      </Alert>
    </Snackbar>
  );
};

export default MessagePopup;
