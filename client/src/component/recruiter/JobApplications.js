import React, { useContext, useEffect, useState } from "react";
import {
  Paper,
  Grid,
  Avatar,
  Typography,
  Chip,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import axios from "axios";
import { makeStyles } from "@mui/styles";
import { useParams } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import { SetPopupContext } from "../../App";
import FilterPopup from "../FilterPopup";
import apiList from "../../modules/apiList";

const useStyles = makeStyles((theme) => ({
  jobTileOuter: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  statusBlock: {
    marginTop: theme.spacing(1),
  },
  popupDialog: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const ApplicationTile = ({ application, getData }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const appliedOn = new Date(application?.dateOfApplication || Date.now());

  const handleClose = () => {
    setOpen(false);
  };

  const getResume = () => {
    if (application?.jobApplicant?.resume) {
      axios
        .get(`${apiList.resumeDownload}/${application.jobApplicant.resume}`, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `${application.jobApplicant.name}_resume.pdf`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((err) => {
          console.log(err.response);
        });
    }
  };

  const buttonSet = {
    applied: (
      <Button variant="contained" color="secondary">
        Reject
      </Button>
    ),
    shortlisted: (
      <>
        <Button variant="contained" color="primary">
          Accept
        </Button>
        <Button variant="contained" color="secondary">
          Reject
        </Button>
      </>
    ),
    rejected: (
      <Typography variant="body2" style={{ color: "red" }}>
        Rejected
      </Typography>
    ),
  };

  if (!application || !application.jobApplicant) {
    return null;
  }

  return (
    <Paper className={classes.jobTileOuter} elevation={3}>
      <Grid container>
        <Grid
          item
          xs={2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            src={`${apiList.server}${
              application?.jobApplicant?.profile || ""
            }`} // Ensure profile exists
            className={classes.avatar}
          />
        </Grid>
        <Grid container item xs={7} spacing={1} direction="column">
          <Grid item>
            <Typography variant="h5">
              {application?.jobApplicant?.name || "No Name Provided"}
            </Typography>
          </Grid>
          <Grid item>
            <Rating
              value={
                application?.jobApplicant?.rating !== -1
                  ? application.jobApplicant.rating
                  : null
              }
              readOnly
            />
          </Grid>
          <Grid item>Applied On: {appliedOn.toLocaleDateString()}</Grid>
          <Grid item>
            Education:{" "}
            {application?.jobApplicant?.education
              ?.map((edu) => {
                return `${edu.institutionName} (${edu.startYear}-${
                  edu.endYear ? edu.endYear : "Ongoing"
                })`;
              })
              .join(", ") || "No Education Information"}
          </Grid>
          <Grid item>
            SOP: {application?.sop !== "" ? application.sop : "Not Submitted"}
          </Grid>
          <Grid item>
            {application?.jobApplicant?.skills?.map((skill) => (
              <Chip label={skill} style={{ marginRight: "2px" }} key={skill} />
            )) || "No Skills Provided"}
          </Grid>
        </Grid>
        <Grid item container direction="column" xs={3}>
          <Grid item>
            <Button
              variant="contained"
              className={classes.statusBlock}
              color="primary"
              onClick={() => getResume()}
            >
              Download Resume
            </Button>
          </Grid>
          <Grid item container xs>
            {buttonSet[application.status]}
          </Grid>
        </Grid>
      </Grid>
      <Modal open={open} onClose={handleClose} className={classes.popupDialog}>
        <Paper
          style={{
            padding: "20px",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "30%",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            style={{ padding: "10px 50px" }}
          >
            Submit
          </Button>
        </Paper>
      </Modal>
    </Paper>
  );
};

const JobApplications = () => {
  const setPopup = useContext(SetPopupContext);
  const [applications, setApplications] = useState([]);
  const { jobId } = useParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    status: {
      all: false,
      applied: false,
      shortlisted: false,
    },
    sort: {
      "jobApplicant.name": {
        status: false,
        desc: false,
      },
      dateOfApplication: {
        status: true,
        desc: true,
      },
      "jobApplicant.rating": {
        status: false,
        desc: false,
      },
    },
  });

  useEffect(() => {
    getData();
  }, [searchOptions, jobId]);

  const getData = () => {
    let searchParams = [];

    if (searchOptions.status.rejected) {
      searchParams.push(`status=rejected`);
    }
    if (searchOptions.status.applied) {
      searchParams.push(`status=applied`);
    }
    if (searchOptions.status.shortlisted) {
      searchParams.push(`status=shortlisted`);
    }

    let asc = [],
      desc = [];

    Object.keys(searchOptions.sort).forEach((obj) => {
      const item = searchOptions.sort[obj];
      if (item.status) {
        if (item.desc) {
          desc.push(`desc=${obj}`);
        } else {
          asc.push(`asc=${obj}`);
        }
      }
    });

    searchParams = [...searchParams, ...asc, ...desc];
    const queryString = searchParams.join("&");
    let address = `${apiList.applicants}?jobId=${jobId}`;
    if (queryString !== "") {
      address = `${address}&${queryString}`;
    }

    axios
      .get(address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setApplications(response.data);
      })
      .catch((err) => {
        setApplications([]);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };

  return (
    <>
      <Grid
        container
        item
        direction="column"
        alignItems="center"
        style={{ padding: "30px", minHeight: "93vh" }}
      >
        <Grid item>
          <Typography variant="h2">Applications</Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setFilterOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Grid>
        <Grid
          container
          item
          xs
          direction="column"
          style={{ width: "100%" }}
          alignItems="stretch"
        >
          {applications.length > 0 ? (
            applications.map((obj) => (
              <Grid item key={obj._id}>
                <ApplicationTile application={obj} getData={getData} />
              </Grid>
            ))
          ) : (
            <Typography variant="h5" style={{ textAlign: "center" }}>
              No Applications Found
            </Typography>
          )}
        </Grid>
      </Grid>
      <FilterPopup
        open={filterOpen}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        handleClose={() => setFilterOpen(false)}
        getData={() => {
          getData();
          setFilterOpen(false);
        }}
      />
    </>
  );
};

export default JobApplications;
