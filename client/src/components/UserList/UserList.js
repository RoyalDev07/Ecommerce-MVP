import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import axios from "axios";
import { API_URL } from "../../constants";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
import { compose } from "redux";
import AddIcon from "@material-ui/icons/Add";
import _ from "lodash";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Formik } from "formik";
import * as Yup from "yup";

import { getCurrentUser, isLoggedIn } from "../../redux/auth/selector";

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

function UserList({ currentUser }) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const addUser = async values => {
    //newData.user: auth.user.username
    return new Promise((resolve, reject) => {
      axios
        .post(API_URL + "user/", {
          ...values
        })
        .then(function(response) {
          console.log(response.data);
          let newUser = { ...response.data };
          const data1 = [...data];
          data1.push(newUser);
          setData(data1);
          handleClose();
          resolve();
        })
        .catch(function(error) {
          handleClose();
          reject();
        });
    });
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const removeUser = async oldData => {
    return new Promise((resolve, reject) => {
      axios
        .delete(`${API_URL}user/${oldData.id}/`)
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

  const updateUser = (newData, oldData) => {
    const data1 = [...data];
    const index = getIndex(data1, oldData);
    return new Promise((resolve, reject) => {
      axios
        .put(`${API_URL}user/${oldData.id}/`, newData)
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
    if (!columns.length)
      setColumns([
        { title: "Id", field: "id", type: "numeric", editable: "never" },
        { title: "UserName", field: "username" },
        { title: "Role", field: "role" }
      ]);
    if (!!role)
      axios
        .get(`${API_URL}user/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then(function(response) {
          if (!_.isEqual(data, response.data)) setData(response.data);
        })
        .catch(function(error) {});
  }, [currentUser, data, columns.length]);

  return (
    <div className={classes.root} style={{ marginTop: "20px" }}>
      <Grid container justify="center" spacing={3}>
        <Grid item lg={10}>
          <div className={classes.button}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              className={classes.reportButton}
              onClick={handleClickOpen}
            >
              <AddIcon></AddIcon>
              Add User
            </Button>
          </div>
          <MaterialTable
            title="Entry Table"
            columns={columns}
            data={data}
            editable={{
              onRowUpdate: updateUser,
              onRowDelete: removeUser
            }}
            options={{
              search: false
            }}
          />
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add User</DialogTitle>
        <Formik
          initialValues={{
            username: "",
            role: "user",
            password: ""
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string().required("Required"),
            role: Yup.string().required("Required"),
            password: Yup.string().required("Required")
          })}
          onSubmit={addUser}
          render={formProps => {
            const { touched, errors, handleChange } = formProps;
            return (
              <form onSubmit={formProps.handleSubmit}>
                <DialogContent>
                  <DialogContentText>
                    To add user, fill the fields following and press OK.
                  </DialogContentText>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={formProps.values.username}
                    onChange={handleChange}
                    helperText={
                      errors.username && touched.username && errors.username
                    }
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="role"
                    label="Role"
                    type="text"
                    id="Role"
                    autoComplete="role"
                    value={formProps.values.role}
                    onChange={handleChange}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formProps.values.password}
                    onChange={handleChange}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    OK
                  </Button>
                </DialogActions>
                <Grid container>
                  <Grid item xs></Grid>
                  <Grid item></Grid>
                </Grid>
              </form>
            );
          }}
        />
      </Dialog>
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  currentUser: getCurrentUser(),
  isLoggedIn: isLoggedIn()
});

const mapDispatchToProps = {};

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(UserList);
