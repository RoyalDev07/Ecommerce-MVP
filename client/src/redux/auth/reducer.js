import { SIGN_IN } from "./actionTypes";
import { handleActions } from "redux-actions";
const initialState = {
  isLoggedIn: false,
  user: {}
};

export default handleActions(
  {
    [SIGN_IN]: (state, { payload }) => {
      return {
        ...state,
        user: payload,
        error: null
      };
    }
  },
  initialState
);
