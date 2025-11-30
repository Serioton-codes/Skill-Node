import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router v6
import axios from "axios";
import { Box, Button, Paper, TextField, Typography } from "@mui/material"; // Material UI v5
import PasswordInput from "../../modules/PasswordInput";
import EmailInput from "../../modules/EmailInput";
import { SetPopupContext } from "../../App";
import apiList from "../../modules/apiList";
import isAuth from "../../modules/isAuth";
 
const Login = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [loggedin, setLoggedin] = useState(isAuth());
  const navigate = useNavigate(); // React Router v6
 
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
 
  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: {
      error: false,
      message: "",
    },
    password: {
      error: false,
      message: "",
    },
  });
 
  const handleInput = (key, value) => {
    setLoginDetails({
      ...loginDetails,
      [key]: value,
    });
  };
 
  const handleInputError = (key, status, message) => {
    setInputErrorHandler({
      ...inputErrorHandler,
      [key]: {
        error: status,
        message: message,
      },
    });
  };
 
  const handleLogin = () => {
    const verified = !Object.keys(inputErrorHandler).some((obj) => {
      return inputErrorHandler[obj].error;
    });
    if (verified) {
      axios
        .post(apiList.login, loginDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({
            open: true,
            severity: "success",
            message: "Logged in successfully",
          });
          navigate("/"); // Use navigate to redirect
          console.log(response);
        })
        .catch((err) => {
          setPopup({
            open: true,
            severity: "error",
            message: err.response.data.message,
          });
          console.log(err.response);
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
    }
  };
 
  return loggedin ? (
    navigate("/") // Navigate if already logged in
  ) : (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login 
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={loginDetails.email}
            onChange={(event) => handleInput("email", event.target.value)}
            error={inputErrorHandler.email.error}
            helperText={inputErrorHandler.email.message}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            value={loginDetails.password}
            onChange={(event) => handleInput("password", event.target.value)}
            error={inputErrorHandler.password.error}
            helperText={inputErrorHandler.password.message}
          />
          <Button
            onClick={handleLogin}
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "primary.main",
              ":hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
 
export default Login;