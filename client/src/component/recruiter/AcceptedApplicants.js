import { useState, useEffect, useContext } from "react";
import {
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Modal,
  Rating,
  Checkbox,
  Avatar,
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import { styled, useTheme } from '@mui/material/styles';
import axios from "axios";

import { SetPopupContext } from "../../App";
import apiList, { server } from "../../modules/apiList";

const useStyles = styled((theme) => ({
  body: {
    height: "inherit",
  },
  statusBlock: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "uppercase",
  },
  jobTileOuter: {
    padding: "30px",
    margin: "20px 0",
    boxSizing: "border-box",
    width: "100%",
  },
  popupDialog: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: theme.spacing(17),
    height: theme.spacing(17),
  },
}));

const FilterPopup = (props) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const { open, handleClose, searchOptions, setSearchOptions, getData } = props;

  return (
    <Modal open={open} onClose={handleClose} className={classes.popupDialog}>
      <Paper
        sx={{
          padding: "50px",
          outline: "none",
          minWidth: "50%",
        }}
      >
        <Grid container direction="column" alignItems="center" spacing={3}>
          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Sort
            </Grid>
            <Grid item container direction="row" xs={9}>
              {Object.keys(searchOptions.sort).map((key) => {
                const sortOption = searchOptions.sort[key];
                return (
                  <Grid
                    item
                    container
                    xs={6}
                    justifyContent="space-around"
                    alignItems="center"
                    sx={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
                    key={key}
                  >
                    <Grid item>
                      <Checkbox
                        name={key}
                        checked={sortOption.status}
                        onChange={(event) =>
                          setSearchOptions({
                            ...searchOptions,
                            sort: {
                              ...searchOptions.sort,
                              [key]: {
                                ...sortOption,
                                status: event.target.checked,
                              },
                            },
                          })
                        }
                        id={key}
                      />
                    </Grid>
                    <Grid item>
                      <label htmlFor={key}>
                        <Typography>{key.split(".").pop().replace(/([A-Z])/g, ' $1').trim()}</Typography>
                      </label>
                    </Grid>
                    <Grid item>
                      <IconButton
                        disabled={!sortOption.status}
                        onClick={() => {
                          setSearchOptions({
                            ...searchOptions,
                            sort: {
                              ...searchOptions.sort,
                              [key]: {
                                ...sortOption,
                                desc: !sortOption.desc,
                              },
                            },
                          });
                        }}
                      >
                        {sortOption.desc ? (
                          <ArrowDownwardIcon />
                        ) : (
                          <ArrowUpwardIcon />
                        )}
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              sx={{ padding: "10px 50px" }}
              onClick={() => getData()}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

const ApplicationTile = (props) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const { application, getData } = props;
  const setPopup = useContext(SetPopupContext);
  const [open, setOpen] = useState(false);
  const [openEndJob, setOpenEndJob] = useState(false);
  
  // Optional chaining used to handle undefined case
  const [rating, setRating] = useState(application?.jobApplicant?.rating || 0);

  const appliedOn = new Date(application?.dateOfApplication || Date.now());

  if (!application || !application.jobApplicant) {
    // Render a fallback component or return null until the data is loaded
    return <Typography>No Applicants Found!!</Typography>;
  }

  const changeRating = () => {
    axios
      .put(
        apiList.rating,
        { rating: rating, applicantId: application.jobApplicant.userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: "Rating updated successfully",
        });
        getData();
        setOpen(false);
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        getData();
        setOpen(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseEndJob = () => {
    setOpenEndJob(false);
  };

  const colorSet = {
    applied: "#3454D1",
    shortlisted: "#DC851F",
    accepted: "#09BC8A",
    rejected: "#D1345B",
    deleted: "#B49A67",
    cancelled: "#FF8484",
    finished: "#4EA5D9",
  };

  const getResume = () => {
    if (application.jobApplicant?.resume && application.jobApplicant.resume !== "") {
      const address = `${server}${application.jobApplicant.resume}`;
      axios(address, {
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const file = new Blob([response.data], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        })
        .catch((error) => {
          setPopup({
            open: true,
            severity: "error",
            message: "Error",
          });
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "No resume found",
      });
    }
  };

  const updateStatus = (status) => {
    const address = `${apiList.applications}/${application._id}`;
    const statusData = {
      status: status,
      dateOfJoining: new Date().toISOString(),
    };
    axios
      .put(address, statusData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        handleCloseEndJob();
        getData();
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        handleCloseEndJob();
      });
  };

  return (
    <Paper className={classes.jobTileOuter} elevation={3}>
      <Grid container>
        <Grid
          item
          xs={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            src={`${server}${application.jobApplicant.profile}`}
            className={classes.avatar}
          />
        </Grid>
        <Grid container item xs={7} spacing={1} direction="column">
          <Grid item>
            <Typography variant="h5">
              {application.jobApplicant.name}
            </Typography>
          </Grid>
          <Grid item>
            <Rating
              value={application.jobApplicant.rating !== -1 ? application.jobApplicant.rating : null}
              readOnly
            />
          </Grid>
          <Grid item>Job Title: {application.job.title}</Grid>
          <Grid item>Role: {application.job.jobType}</Grid>
          <Grid item>Applied On: {appliedOn.toLocaleDateString()}</Grid>
          <Grid item>
            SOP: {application.sop !== "" ? application.sop : "Not Submitted"}
          </Grid>
          <Grid item>
            {application.jobApplicant.skills.map((skill) => (
              <Chip label={skill} sx={{ marginRight: "2px" }} />
            ))}
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            onClick={() => setOpen(true)}
            fullWidth
            sx={{ marginBottom: "5px" }}
          >
            Rate
          </Button>
          <Button
            variant="outlined"
            onClick={getResume}
            fullWidth
            sx={{ marginBottom: "5px" }}
          >
            Get Resume
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenEndJob(true)}
            fullWidth
          >
            End Job
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};


export default ApplicationTile;
