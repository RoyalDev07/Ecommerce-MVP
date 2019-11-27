import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";

import { ApolloProvider } from "@apollo/react-hooks";
//import { Provider } from "react-redux";
//import { createStore } from "redux";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { object } from "prop-types";
//import { reducers } from "./redux";

const cache = new InMemoryCache({
  dataIdFromObject: object => object.key || null
});

const httpLink = createHttpLink({
  uri: "http://localhost:8192/graphql"
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : ""
    }
  };
});
const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink)
});
cache.writeData({
  data: {
    currentUser: {
      username: null,
      password: null,
      id: null,
      role: null,
      __typename: null
    }
  }
});
//const store = createStore(reducers);
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
