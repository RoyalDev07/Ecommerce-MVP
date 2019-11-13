import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

import "./App.css";
import Header from "./components/Header";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import EntryList from "./components/EntryList";
import PageNotFound from "./components/PageNotFound";
import UserList from "./components/UserList";

function App() {
  return (
    <>
      <Header></Header>
      <BrowserRouter>
        <Switch>
          <Route path="/signin" component={SignIn}></Route>
          <Route path="/signup" component={SignUp}></Route>
          <Route path="/entry" component={EntryList}></Route>
          <Route path="/user" component={UserList}></Route>
          <Route component={PageNotFound}></Route>
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
