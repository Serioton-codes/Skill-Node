import { useState } from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from "@mui/material"; // Updated import for MUI v5
import Visibility from "@mui/icons-material/Visibility"; // Updated import for MUI v5
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // Updated import for MUI v5

const PasswordInput = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <FormControl
      variant="outlined"
      error={!!props.error} // Ensure proper boolean handling for error prop
      fullWidth={props.fullWidth} // Simply pass fullWidth without defaulting to true here
      className={props.className} // ClassName handling for custom styling
    >
      <InputLabel htmlFor={props.id || "outlined-adornment-password"}>{props.label}</InputLabel>
      <OutlinedInput
  id={props.id || "outlined-adornment-password"}
  type={showPassword ? "text" : "password"}
  value={props.value}
  onChange={props.onChange}  // This will now correctly trigger onChange in the parent component
  endAdornment={
    <InputAdornment position="end">
      <IconButton
        onClick={handleShowPassword}
        onMouseDown={handleMouseDownPassword}
        edge="end"
      >
        {showPassword ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </InputAdornment>
  }
  label={props.label}
  onBlur={props.onBlur}
/>

      {props.helperText && (
        <FormHelperText>{props.helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// You could also add defaultProps to handle default values
PasswordInput.defaultProps = {
  fullWidth: true, // By default fullWidth will be true
  error: false,
};

export default PasswordInput;
