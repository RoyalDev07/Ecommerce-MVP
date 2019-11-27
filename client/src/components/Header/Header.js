import React, { useEffect } from "react";
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
import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "@apollo/react-hoc";

// import { createStructuredSelector } from "reselect";
// import { connect } from "react-redux";
// import { compose } from "redux";
// import { getCurrentUser, isLoggedIn } from "../../redux/auth/selector";
//import { signIn } from "../../redux/auth/actions";
import { CURRENT_USER, CURRENT_USER1 } from "../../grqphql/query";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import gql from "graphql-tag";

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
function Header({ client }) {
  const classes = useStyles();
  const token = localStorage.getItem("token");
  const { data, refetch } = useQuery(CURRENT_USER1, {
    variables: {},
    onCompleted: ({ currentUser }) => {
      client.writeData({
        data: {
          currentUser
        }
      });
    }
  });
  refetch();
  useEffect(() => {
    //    currentUser();
  }, [token]);

  /* Menu Settings */
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

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
            {(data.currentUser.role === "user" || data.currentUser.role === "admin") && (
              <Button color="inherit" onClick={signOut}>
                Entry
              </Button>
            )}
            {data.currentUser.role === "manager" && (
              <Button color="inherit" onClick={goToUserPage}>
                Users
              </Button>
            )}
            {
              <>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                  {data.currentUser.username}
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
            }
          </Toolbar>
        </AppBar>
      </div>
    </ThemeProvider>
  );
}

export default withApollo(Header);

// const mapStateToProps = createStructuredSelector({
//   currentUser: getCurrentUser(),
//   isLoggedIn: isLoggedIn()
// });

// const mapDispatchToProps = {
//   signIn: signIn
// };

// const withConnect = connect(mapStateToProps, mapDispatchToProps);

// export default compose(withConnect)(Header);
