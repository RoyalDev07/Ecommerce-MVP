import { SIGN_IN, SIGN_UP } from "./actionTypes";

import { createAction } from "redux-actions";

export const signIn = createAction(SIGN_IN);
export const signUp = createAction(SIGN_UP);
