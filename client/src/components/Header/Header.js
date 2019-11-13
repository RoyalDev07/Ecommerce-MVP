import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import blue from "@material-ui/core/colors/blue";
import { API_URL } from "../../constants";
import axios from "axios";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
import { compose } from "redux";
import { getCurrentUser, isLoggedIn } from "../../redux/auth/selector";
import { signIn } from "../../redux/auth/actions";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
const theme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: blue
  }
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(0)
  },
  title: {
    flexGrow: 1
  }
}));

export default function Header() {
  let currentUser = {};
  const classes = useStyles();
  const token = localStorage.getItem("token");

  const [isLoggedIn] = useState(!!token);
  const role = currentUser.role;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  useEffect(() => {
    if (
      !!localStorage.getItem("token") &&
      Object.keys(currentUser).length === 0
    )
      axios
        .get(API_URL + "get_user/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then(function(response) {
          signIn(response.data.user);
        });
  });
  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const goToUserPage = () => {
    window.location.href = "/user";
  };
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <AppBar position="static" color="secondary">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Jogging Track
            </Typography>
            {(role === "user" || role === "admin") && (
              <Button color="inherit" onClick={signOut}>
                Entry
              </Button>
            )}
            {role === "manager" && (
              <Button color="inherit" onClick={goToUserPage}>
                Users
              </Button>
            )}
            {isLoggedIn && (
              <>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                  {currentUser.username}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={signOut}>Sign Out</MenuItem>
                  <MenuItem onClick={handleClose}>My account</MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>
      </div>
    </ThemeProvider>
  );
}
// const mapStateToProps = createStructuredSelector({
//   currentUser: getCurrentUser(),
//   isLoggedIn: isLoggedIn()
// });

// const mapDispatchToProps = {
//   signIn: signIn
// };

// const withConnect = connect(mapStateToProps, mapDispatchToProps);

// export default compose(withConnect)(Header);
