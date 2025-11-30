import React, { useState, useContext } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Chip,
  Box
} from "@mui/material";
import axios from "axios";
import { Navigate } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import FaceIcon from "@mui/icons-material/Face";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import PasswordInput from "../../modules/PasswordInput";  // Ensure this component is updated
import EmailInput from "../../modules/EmailInput"; // Ensure this component is updated
import FileUploadInput from "../../modules/FileUploadInput";
import { SetPopupContext } from "../../App";

import apiList from "../../modules/apiList";
import isAuth from "../../modules/isAuth";

const Signup = () => {
  const setPopup = useContext(SetPopupContext);
  const [loggedin, setLoggedin] = useState(isAuth());

  const [signupDetails, setSignupDetails] = useState({
    type: "applicant",
    email: "",
    password: "",
    name: "",
    education: [],
    skills: [],
    resume: "",
    profile: "",
    bio: "",
    contactNumber: "",
    companyName: "",
    companyWebsite: ""
  });

  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState([
    {
      institutionName: "",
      startYear: "",
      endYear: ""
    }
  ]);

  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: {
      untouched: true,
      required: true,
      error: false,
      message: ""
    },
    password: {
      untouched: true,
      required: true,
      error: false,
      message: ""
    },
    name: {
      untouched: true,
      required: true,
      error: false,
      message: ""
    }
  });

  const handleInput = (key, value) => {
    setSignupDetails({
      ...signupDetails,
      [key]: value
    });
  };

  const handleInputError = (key, status, message) => {
    setInputErrorHandler({
      ...inputErrorHandler,
      [key]: {
        required: true,
        untouched: false,
        error: status,
        message: message
      }
    });
  };

  const handleLogin = () => {
    const tmpErrorHandler = {};
    Object.keys(inputErrorHandler).forEach((obj) => {
      if (inputErrorHandler[obj].required && inputErrorHandler[obj].untouched) {
        tmpErrorHandler[obj] = {
          required: true,
          untouched: false,
          error: true,
          message: `${obj[0].toUpperCase() + obj.substr(1)} is required`
        };
      } else {
        tmpErrorHandler[obj] = inputErrorHandler[obj];
      }
    });

    let updatedDetails = {
      ...signupDetails,
      education: education
        .filter((obj) => obj.institutionName.trim() !== "")
        .map((obj) => {
          if (obj["endYear"] === "") {
            delete obj["endYear"];
          }
          return obj;
        })
    };

    setSignupDetails(updatedDetails);

    const verified = !Object.keys(tmpErrorHandler).some((obj) => {
      return tmpErrorHandler[obj].error;
    });

    if (verified) {
      axios
        .post(apiList.signup, updatedDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({
            open: true,
            severity: "success",
            message: "Signed up successfully"
          });
        })
        .catch((err) => {
          setPopup({
            open: true,
            severity: "error",
            message:
              err.response?.data?.message || "An error occurred. Please try again."
          });
        });
    } else {
      setInputErrorHandler(tmpErrorHandler);
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input"
      });
    }
  };

  const handleChipAdd = (chip) => {
    handleInput("skills", [...signupDetails.skills, chip]);
  };

  const handleChipDelete = (chip, index) => {
    handleInput("skills", signupDetails.skills.filter((_, i) => i !== index));
  };

  return loggedin ? (
    <Navigate to="/" />
  ) : (
    <Paper elevation={3} sx={{ padding: "60px" }}>
      <Grid container direction="column" spacing={4} alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h2">
            Signup
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            select
            label="Category"
            variant="outlined"
            sx={{ width: "400px" }}
            value={signupDetails.type}
            onChange={(event) => {
              handleInput("type", event.target.value);
            }}
          >
            <MenuItem value="applicant">Applicant</MenuItem>
            <MenuItem value="recruiter">Recruiter</MenuItem>
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            label="Email"
            variant="outlined"
            sx={{ width: "400px" }}
            value={signupDetails.email}
            onChange={(event) => {
              handleInput("email", event.target.value);
              if (event.target.value === "") {
                handleInputError("email", true, "Email is required");
              } else {
                handleInputError("email", false, "");
              }
            }}
            error={inputErrorHandler.email.error}
            helperText={inputErrorHandler.email.message}
          />
        </Grid>
        <Grid item>
        <PasswordInput
          label="Password"
          value={signupDetails.password}
          onChange={(event) => {
            const value = event.target.value;
            handleInput("password", value);  // Update the parent state
            if (value === "") {
              handleInputError("password", true, "Password is required");
            } else {
              handleInputError("password", false, "");
            }
          }}
          error={inputErrorHandler.password.error}
          helperText={inputErrorHandler.password.message}
        />

        </Grid>
        <Grid item sx={{ mb: "20px" }}>

         
          <TextField
            label="Name"
            variant="outlined"
            sx={{ width: "400px" }}
            value={signupDetails.name}
            onChange={(event) => {
              handleInput("name", event.target.value);
              if (event.target.value === "") {
                handleInputError("name", true, "Name is required");
              } else {
                handleInputError("name", false, "");
              }
            }}
            error={inputErrorHandler.name.error}
            helperText={inputErrorHandler.name.message}
          />
        </Grid>
        {signupDetails.type === "applicant" ? (
          <>
            <Grid container spacing={2} justifyContent="center">
              {education.map((obj, key) => (
                <React.Fragment key={key}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Institution Name"
                      variant="outlined"
                      fullWidth
                      value={obj.institutionName}
                      onChange={(event) => {
                        const updatedEducation = [...education];
                        updatedEducation[key].institutionName = event.target.value;
                        setEducation(updatedEducation);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Start Year"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={obj.startYear}
                      onChange={(event) => {
                        const updatedEducation = [...education];
                        updatedEducation[key].startYear = event.target.value;
                        setEducation(updatedEducation);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="End Year"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={obj.endYear}
                      onChange={(event) => {
                        const updatedEducation = [...education];
                        updatedEducation[key].endYear = event.target.value;
                        setEducation(updatedEducation);
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Button
              variant="contained"
              sx={{
                fontSize:'16px',
                fontWeight: 'bold' ,
                mt: 2,
                color:"green",
                bgcolor: "black",
                
                ":hover": {
                  bgcolor:"#00cc00",
                  color:"black"
                },
              }}
              onClick={() => setEducation([...education, { institutionName: "", startYear: "", endYear: "" }])}
            >
              Add Education
            </Button>
          </>
        ) : (
          <>
            <Grid item>
              <TextField
                label="Company Name"
                variant="outlined"
                sx={{ width: "400px" }}
                value={signupDetails.companyName}
                onChange={(event) => handleInput("companyName", event.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Company Website"
                variant="outlined"
                sx={{ width: "400px" }}
                value={signupDetails.companyWebsite}
                onChange={(event) => handleInput("companyWebsite", event.target.value)}
              />
            </Grid>
          </>
        )}
        <Grid item>
          <PhoneInput
            country="us"
            value={phone}
            onChange={setPhone}
            inputStyle={{ width: "400px" }}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Bio"
            variant="outlined"
            multiline
            rows={4}
            sx={{ width: "400px" }}
            value={signupDetails.bio}
            onChange={(event) => handleInput("bio", event.target.value)}
          />
        </Grid>
      { signupDetails.type==="applicant" &&  <Grid item>
       
        <FileUploadInput
           
            uploadTo={apiList.uploadResume}
            handleInput={(fileName) => handleInput("resume", fileName)}
            name="Resume"
            icon={<DescriptionIcon />}
          />
        </Grid>}
       {signupDetails.type==="applicant" &&  <Grid item>
          <FileUploadInput
            uploadTo={apiList.uploadProfileImage}
            handleInput={(fileName) => handleInput("profile", fileName)}
            name="Profile Image"
            icon={<FaceIcon />}
          />
        </Grid>}
       {signupDetails.type==="applicant" && <Grid item>
          <Typography variant="h6">Skills</Typography>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {signupDetails.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => handleChipDelete(skill, index)}
              />
            ))}
          </Box>
          <TextField
            variant="outlined"
            label="Add Skill"
            sx={{ marginTop: "10px", width: "400px" }}
            onKeyPress={(event) => {
              if (event.key === "Enter" && event.target.value !== "") {
                handleChipAdd(event.target.value);
                event.target.value = "";
              }
            }}
          />
        </Grid>}
        <Grid item>
          <Button 
          sx={{
            fontSize:'16px',
            fontWeight: 'bold' ,
            mt: 2,
            color:"green",
            bgcolor: "black",
            
            ":hover": {
              bgcolor:"#00cc00",
              color:"black"
            },
          }}
          variant="contained" onClick={handleLogin}>
            Signup
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Signup;