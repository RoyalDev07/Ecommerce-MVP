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
import { withApollo } from "@apollo/react-hoc";
import { useMutation, useQuery, useLazyQuery } from "@apollo/react-hooks";
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  DELETE_ENTRY
} from "../../grqphql/mutation";
import { FILTER_ENTRY, CURRENT_USER, WEEKLY_REPORT } from "../../grqphql/query";
import gql from "graphql-tag";
import _ from "lodash";
// import { createStructuredSelector } from "reselect";
// import { connect } from "react-redux";
// import { compose } from "redux";

// import { getCurrentUser, isLoggedIn } from "../../redux/auth/selector";
const query = gql`
  query currentUser {
    username
    role
  }
`;
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
  const classes = useStyles();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const { currentUser } = client.readQuery({
    query: gql`
      query {
        currentUser @client {
          username
          role
        }
      }
    `
  });
  if (!!currentUser) {
    let role = currentUser.role;
    if (role === "USER") {
      if (!columns.length)
        setColumns([
          { title: "Date", field: "date" },
          { title: "Distance", field: "distance", type: "numeric" },
          { title: "Time", field: "time", type: "numeric" }
        ]);
    } else if (role === "ADMIN") {
      if (!columns.length) {
        console.log("Need change in Columns");
        setColumns([
          { title: "Username", field: "user" },
          { title: "Date", field: "date" },
          { title: "Distance", field: "distance", type: "numeric" },
          { title: "Time", field: "time", type: "numeric" }
        ]);
      }
    }
  }
  const [getEntries, entryOptions] = useLazyQuery(FILTER_ENTRY, {
    fetchPolicy: "no-cache",
    onCompleted: response => {
      let data1 = { ...response.allEntries.edges };
      let keys = Object.keys(data1);
      let tempData = keys.map((key, index) => {
        let temp = { ...data1[key].node };
        temp.user = temp.user.username;
        return temp;
      });
      console.log(tempData);
      setData(tempData);
    }
  });
  useEffect(() => {
    getEntries();
    weeklyReport();
  }, []);
  const [weeklyReport, weeklyReportOptions] = useLazyQuery(WEEKLY_REPORT, {
    onCompleted: response => {}
  });
  const [updateEntry] = useMutation(UPDATE_ENTRY);
  const [addEntry] = useMutation(CREATE_ENTRY);
  const [deleteEntry] = useMutation(DELETE_ENTRY);

  const handleClickAddEntry = async newData => {
    let tempData = { ...newData };
    //    const currentUser = client.readQuery({ query });
    //  if (currentUser.role == "user") tempData.user = currentUser.username;
    addEntry({ variables: tempData }).then(function(response) {
      let data1 = [...data];
      data1.push(newData);
      setData(data1);
    });
  };

  const handleClickDeleteEntry = async oldData => {
    return new Promise((resolve, reject) => {
      deleteEntry({
        variables: {
          id: oldData.pk
        }
      })
        .then(function(response) {
          const data1 = [...data];
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

  const handleClickUpdateEntry = (newData, oldData) => {
    const data1 = [...data];
    const index = getIndex(data1, oldData);
    return new Promise((resolve, reject) => {
      console.log(oldData);
      updateEntry({
        variables: {
          ...newData,
          id: oldData.pk
        }
      })
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

  const onFilterSubmit = values => {
    let tempData = { ...values };
    if (tempData.fromDate == "") tempData.fromDate = undefined;
    if (tempData.toDate == "") tempData.toDate = undefined;
    entryOptions.refetch({ ...tempData }).then(function(response) {
      let data1 = { ...response.data.allEntries.edges };
      let keys = Object.keys(data1);
      let tempData = keys.map((key, index) => {
        let temp = { ...data1[key].node };
        temp.user = temp.user.username;
        return temp;
      });
      console.log(tempData);
      setData(tempData);
    });
  };

  const getWeeklyReport = () => {
    console.log(weeklyReportOptions.refetch);
    weeklyReportOptions.refetch().then(function(response) {
      console.log(response);
      let { totalDistance, totalTime } = response.data.weeklyReport;
      let avg_speed = 0;
      console.log(totalDistance, totalTime);
      if (!totalDistance) totalDistance = 0;
      if (!totalTime) totalTime = 0;
      if (totalTime > 0) avg_speed = totalDistance / totalTime;
      window.alert(
        `Total Distance: ${totalDistance}, Total Time: ${totalTime}, Avg Speed: ${avg_speed}`
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
                fromDate: "",
                toDate: ""
              }}
              validationSchema={Yup.object().shape({
                fromDate: Yup.date(),
                toDate: Yup.date()
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
                      name="fromDate"
                      className={classes.textField}
                      label="Start Date"
                      margin="normal"
                      value={values.fromDate}
                      onChange={handleChange}
                      helperText={
                        errors.fromDate && touched.fromDate && errors.fromDate
                      }
                    />
                    <TextField
                      InputLabelProps={{
                        shrink: true
                      }}
                      type="date"
                      name="toDate"
                      className={classes.textField}
                      label="End Date"
                      margin="normal"
                      value={values.toDate}
                      onChange={handleChange}
                      helperText={
                        errors.toDate && touched.toDate && errors.toDate
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
              onRowAdd: handleClickAddEntry,
              onRowUpdate: handleClickUpdateEntry,
              onRowDelete: handleClickDeleteEntry
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
