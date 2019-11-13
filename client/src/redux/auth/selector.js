import { createSelector } from "reselect";

const getAuth = state => state.auth;

export const getCurrentUser = () =>
  createSelector(getAuth, auth => {
    return auth.user;
  });

export const isLoggedIn = () =>
  createSelector(getAuth, auth => auth.isLoggedIn);
