import React, { useState, useEffect, useContext } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Modal,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Slider,
  MenuItem,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import axios from "axios";
import apiList from "../../modules/apiList";
import { SetPopupContext } from "../../App"; // Assuming context from App.js

const useStyles = makeStyles(() => ({
  popupDialog: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const JobTile = ({ job, getData }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {job.title}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {job.company}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {job.location}
          </Typography>
          <Typography variant="body2" color="textPrimary">
            Salary: ${job.salary}
          </Typography>
          <Typography variant="body2" color="textPrimary">
            Duration: {job.duration} months
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            Apply
          </Button>
          <IconButton aria-label="save">
            <BookmarkBorderIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  );
};

const FilterPopup = ({ open, handleClose, searchOptions, setSearchOptions, getData }) => {
  const classes = useStyles();
  return (
    <Modal open={open} onClose={handleClose} className={classes.popupDialog}>
      <Paper
        style={{
          padding: "50px",
          outline: "none",
          minWidth: "50%",
        }}
      >
        <Grid container direction="column" alignItems="center" spacing={3}>
          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Job Type
            </Grid>
            <Grid container item xs={9} justifyContent="space-around">
              {["fullTime", "partTime", "wfh"].map((type) => (
                <Grid item key={type}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={type}
                        checked={searchOptions.jobType[type]}
                        onChange={(event) => {
                          setSearchOptions({
                            ...searchOptions,
                            jobType: {
                              ...searchOptions.jobType,
                              [event.target.name]: event.target.checked,
                            },
                          });
                        }}
                      />
                    }
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Salary
            </Grid>
            <Grid item xs={9}>
              <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value * (100000 / 100)}
                marks={[
                  { value: 0, label: "0" },
                  { value: 100, label: "100000" },
                ]}
                value={searchOptions.salary}
                onChange={(event, value) =>
                  setSearchOptions({
                    ...searchOptions,
                    salary: value,
                  })
                }
              />
            </Grid>
          </Grid>

          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Duration
            </Grid>
            <Grid item xs={9}>
              <TextField
                select
                label="Duration"
                variant="outlined"
                fullWidth
                value={searchOptions.duration}
                onChange={(event) =>
                  setSearchOptions({
                    ...searchOptions,
                    duration: event.target.value,
                  })
                }
              >
                <MenuItem value="0">All</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Sorting Section */}
          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Sort
            </Grid>
            <Grid item container xs={9}>
              {["salary", "duration", "rating"].map((key) => (
                <Grid
                  item
                  container
                  xs={4}
                  key={key}
                  justifyContent="space-around"
                  alignItems="center"
                  style={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
                >
                  <Grid item>
                    <Checkbox
                      name={key}
                      checked={searchOptions.sort[key].status}
                      onChange={(event) =>
                        setSearchOptions({
                          ...searchOptions,
                          sort: {
                            ...searchOptions.sort,
                            [key]: {
                              ...searchOptions.sort[key],
                              status: event.target.checked,
                            },
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid item>
                    <Typography>{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      disabled={!searchOptions.sort[key].status}
                      onClick={() => {
                        setSearchOptions({
                          ...searchOptions,
                          sort: {
                            ...searchOptions.sort,
                            [key]: {
                              ...searchOptions.sort[key],
                              desc: !searchOptions.sort[key].desc,
                            },
                          },
                        });
                      }}
                    >
                      {searchOptions.sort[key].desc ? (
                        <ArrowDownwardIcon />
                      ) : (
                        <ArrowUpwardIcon />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              style={{ padding: "10px 50px" }}
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

const MyJobs = (props) => {
  const [jobs, setJobs] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    query: "",
    jobType: {
      fullTime: false,
      partTime: false,
      wfh: false,
    },
    salary: [0, 100],
    duration: "0",
    sort: {
      salary: {
        status: false,
        desc: false,
      },
      duration: {
        status: false,
        desc: false,
      },
      rating: {
        status: false,
        desc: false,
      },
    },
  });

  const setPopup = useContext(SetPopupContext);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    let searchParams = [`myjobs=1`];
    if (searchOptions.query !== "") searchParams.push(`q=${searchOptions.query}`);
    if (searchOptions.jobType.fullTime) searchParams.push(`jobType=Full%20Time`);
    if (searchOptions.jobType.partTime) searchParams.push(`jobType=Part%20Time`);
    if (searchOptions.jobType.wfh) searchParams.push(`jobType=Work%20From%20Home`);
    if (searchOptions.salary[0] !== 0) searchParams.push(`salaryMin=${searchOptions.salary[0] * 1000}`);
    if (searchOptions.salary[1] !== 100) searchParams.push(`salaryMax=${searchOptions.salary[1] * 1000}`);
    if (searchOptions.duration !== "0") searchParams.push(`duration=${searchOptions.duration}`);

    let asc = [], desc = [];
    Object.keys(searchOptions.sort).forEach((key) => {
      const sortOption = searchOptions.sort[key];
      if (sortOption.status) {
        if (sortOption.desc) {
          desc.push(`desc=${key}`);
        } else {
          asc.push(`asc=${key}`);
        }
      }
    });

    searchParams = [...searchParams, ...asc, ...desc];
    const queryString = searchParams.join("&");
    const address = `${apiList.jobs}${queryString ? `?${queryString}` : ""}`;

    axios
      .get(address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => setJobs(response.data))
      .catch((err) =>
        setPopup({
          open: true,
          severity: "error",
          message: "Error fetching jobs",
        })
      );
  };

  return (
    <>
      <Grid container direction="column" alignItems="center" style={{ padding: "30px", minHeight: "93vh" }}>
        <Grid container item alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4">My Jobs</Typography>
          </Grid>
          <Grid item>
            <TextField
              label="Search Jobs"
              value={searchOptions.query}
              onChange={(event) =>
                setSearchOptions({
                  ...searchOptions,
                  query: event.target.value,
                })
              }
              onKeyPress={(ev) => {
                if (ev.key === "Enter") getData();
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment>
                    <IconButton onClick={getData}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              style={{ width: "300px" }}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <IconButton onClick={() => setFilterOpen(true)}>
              <FilterListIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container item direction="column" alignItems="stretch" justifyContent="center">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobTile key={job._id} job={job} getData={getData} />)
          ) : (
            <Typography variant="h5" style={{ textAlign: "center" }}>
              No jobs found
            </Typography>
          )}
        </Grid>
      </Grid>
      <FilterPopup
        open={filterOpen}
        handleClose={() => setFilterOpen(false)}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        getData={getData}
      />
    </>
  );
};

export default MyJobs;
