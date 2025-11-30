import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from "@mui/material";

const FilterPopup = ({ open, searchOptions, setSearchOptions, handleClose, getData }) => {
  
  const handleStatusChange = (event) => {
    setSearchOptions({
      ...searchOptions,
      status: {
        ...searchOptions.status,
        [event.target.name]: event.target.checked,
      },
    });
  };

  const handleSortChange = (event, field) => {
    setSearchOptions({
      ...searchOptions,
      sort: {
        ...searchOptions.sort,
        [field]: {
          ...searchOptions.sort[field],
          status: event.target.checked,
          desc: searchOptions.sort[field].desc, // Keep the sort order
        },
      },
    });
  };

  const toggleSortOrder = (field) => {
    setSearchOptions({
      ...searchOptions,
      sort: {
        ...searchOptions.sort,
        [field]: {
          ...searchOptions.sort[field],
          desc: !searchOptions.sort[field].desc,
        },
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Filter and Sort Applications</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchOptions.status.applied}
                  onChange={handleStatusChange}
                  name="applied"
                />
              }
              label="Applied"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchOptions.status.shortlisted}
                  onChange={handleStatusChange}
                  name="shortlisted"
                />
              }
              label="Shortlisted"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchOptions.status.rejected}
                  onChange={handleStatusChange}
                  name="rejected"
                />
              }
              label="Rejected"
            />
          </FormGroup>

          <Grid item>
            <Button
              variant="contained"
              onClick={() => toggleSortOrder("dateOfApplication")}
            >
              Sort by Date {searchOptions.sort.dateOfApplication.desc ? "Descending" : "Ascending"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => toggleSortOrder("jobApplicant.name")}
            >
              Sort by Name {searchOptions.sort["jobApplicant.name"].desc ? "Descending" : "Ascending"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => toggleSortOrder("jobApplicant.rating")}
            >
              Sort by Rating {searchOptions.sort["jobApplicant.rating"].desc ? "Descending" : "Ascending"}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            getData();
            handleClose();
          }}
          color="primary"
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterPopup;
