import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import axios from "axios";
import { API_URL } from "../../constants";
import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";
import { Formik } from "formik";
import * as Yup from "yup";
import DescriptionRoundedIcon from "@material-ui/icons/DescriptionRounded";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
import { compose } from "redux";
import { withApollo } from "@apollo/react-hoc";

import { getCurrentUser, isLoggedIn } from "../../redux/auth/selector";

import _ from "lodash";
const useStyles = makeStyles(theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  root: {},
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  container: {
    padding: 20
  },
  textField: {
    margin: "auto",
    marginTop: 20,
    marginLeft: 40
  },
  button: {
    marginRight: theme.spacing(1),
    marginTop: 20,
    display: "flex",
    justifyContent: "flex-end"
  },
  rightAlignContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end"
  },
  reportButton: {
    marginBottom: 20,
    marginRight: theme.spacing(3)
  }
}));

function getIndex(array, value) {
  let i,
    len = array.length;
  for (i = 0; i < len; i++) {
    if (array[i].id === value.id) return i;
  }
  return -1;
}

function EntryList({ client }) {
  console.log(client);
  let currentUser = {};
  const classes = useStyles();
  const [columns, setColumns] = useState([]);

  const [data, setData] = useState([]);

  const addEntry = async newData => {
    //newData.user: auth.user.username
    if (currentUser.role === "user") newData.user = currentUser.username;
    let user = await axios.post(API_URL + "get_user_id/", {
      username: newData.user
    });
    let tempData = { ...newData };
    tempData.user = user.data.user;
    console.log(tempData.user);
    if (!tempData.user) {
      window.alert("You input invalid user!");
      return;
    }
    return new Promise((resolve, reject) => {
      axios
        .post(API_URL + "entry/", {
          ...tempData
        })
        .then(function(response) {
          const data1 = [...data];
          data1.push(newData);
          console.log(data1);
          setData(data1);
          resolve();
        })
        .catch(function(error) {
          reject();
        });
    });
  };

  const removeEntry = async oldData => {
    return new Promise((resolve, reject) => {
      axios
        .delete(`${API_URL}entry/${oldData.id}/`)
        .then(function(response) {
          let data1 = [...data];
          const index = getIndex(data1, oldData);
          data1.splice(index, 1);
          setData(data1);
          resolve();
        })
        .catch(function(error) {
          reject();
        });
    });
  };

  const updateEntry = (newData, oldData) => {
    const data1 = [...data];
    const index = getIndex(data1, oldData);
    return new Promise((resolve, reject) => {
      axios
        .put(`${API_URL}entry/${oldData.id}/`, newData)
        .then(function(response) {
          data1[index] = newData;
          setData(data1);
          resolve();
        })
        .catch(function(error) {
          reject();
        });
    });
  };

  useEffect(() => {
    let role = currentUser.role;
    console.log(role);
    if (role === "user") {
      if (!columns.length)
        setColumns([
          { title: "Date", field: "date" },
          { title: "Distance", field: "distance", type: "numeric" },
          { title: "Time", field: "time", type: "numeric" }
        ]);
    } else if (role === "admin") {
      if (!columns.length)
        setColumns([
          { title: "Username", field: "user" },
          { title: "Date", field: "date" },
          { title: "Distance", field: "distance", type: "numeric" },
          { title: "Time", field: "time", type: "numeric" }
        ]);
    }

    //Get Entry Data

    if (!!role)
      axios
        .get(`${API_URL}entry/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then(function(response) {
          if (!_.isEqual(data, response.data)) setData(response.data);
        })
        .catch(function(error) {});
  }, [currentUser, columns.length, data]);

  const onFilterSubmit = values => {
    let startDate = !!values.startDate ? `from_date=${values.startDate}&` : "",
      endDate = !!values.endDate ? `to_date=${values.endDate}` : "";
    axios
      .get(`${API_URL}entry/?${startDate}${endDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(function(response) {
        setData(response.data);
      });
  };

  const getWeeklyReport = () => {
    axios
      .get(`${API_URL}entry/weekly_report/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(function(response) {
        let { total_distance, total_time } = response.data,
          avg_speed = 0;
        if (!total_distance) total_distance = 0;
        if (!total_time) total_time = 0;
        if (total_time > 0) avg_speed = total_distance / total_time;
        window.alert(
          `Total Distance: ${total_distance}, Total Time: ${total_time}, Avg Speed: ${avg_speed}`
        );
      });
  };
  return (
    <div className={classes.root} style={{ marginTop: "20px" }}>
      <div className={classes.button}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          className={classes.reportButton}
          onClick={getWeeklyReport}
        >
          <DescriptionRoundedIcon></DescriptionRoundedIcon>
          Weekly Report
        </Button>
      </div>
      <Grid container justify="space-around" spacing={3}>
        <Grid item lg={3}>
          <Paper className={classes.container}>
            <Formik
              initialValues={{
                startDate: "",
                endDate: ""
              }}
              validationSchema={Yup.object().shape({
                startDate: Yup.date(),
                endDate: Yup.date()
              })}
              onSubmit={onFilterSubmit}
              render={formProps => {
                const { values, touched, errors, handleChange } = formProps;
                return (
                  <form onSubmit={formProps.handleSubmit}>
                    <TextField
                      InputLabelProps={{
                        shrink: true
                      }}
                      type="date"
                      name="startDate"
                      className={classes.textField}
                      label="Start Date"
                      margin="normal"
                      value={values.startDate}
                      onChange={handleChange}
                      helperText={
                        errors.startDate &&
                        touched.startDate &&
                        errors.startDate
                      }
                    />
                    <TextField
                      InputLabelProps={{
                        shrink: true
                      }}
                      type="date"
                      name="endDate"
                      className={classes.textField}
                      label="End Date"
                      margin="normal"
                      value={values.endDate}
                      onChange={handleChange}
                      helperText={
                        errors.endDate && touched.endDate && errors.endDate
                      }
                    />
                    <div className={classes.rightAlignContainer}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        type="submit"
                        endIcon={<Icon>send</Icon>}
                      >
                        Filter
                      </Button>
                    </div>
                  </form>
                );
              }}
            />
          </Paper>
        </Grid>
        <Grid item lg={8}>
          <MaterialTable
            title="Entry Table"
            columns={columns}
            data={data}
            editable={{
              onRowAdd: addEntry,
              onRowUpdate: updateEntry,
              onRowDelete: removeEntry
            }}
            options={{
              search: false
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}

// const mapStateToProps = createStructuredSelector({
//   currentUser: getCurrentUser(),
//   isLoggedIn: isLoggedIn()
// });

// const mapDispatchToProps = {};

// const withConnect = connect(mapStateToProps, mapDispatchToProps);

// export default compose(withConnect)(EntryList);
export default withApollo(EntryList);
