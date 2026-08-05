/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

type TAuthState = {
  user: null | any;
  access_token: null | string;
  refresh_token: null | string;
  signupEmail: null | string; // ✅ top-level — never touched by setUser
};

const initialState: TAuthState = {
  user: null,
  access_token: null,
  refresh_token: null,
  signupEmail: null, // ✅ lives here, not inside user
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user?: any;
        access_token?: string;
        refresh_token?: string;
      }>
    ) => {
      const { user, access_token, refresh_token } = action.payload;
      // ✅ Only overwrite fields that are actually provided
      // This means signupEmail (top-level) is NEVER touched here
      if (user !== undefined) state.user = user;
      if (access_token !== undefined) state.access_token = access_token;
      if (refresh_token !== undefined) state.refresh_token = refresh_token;
    },

    setSignupEmail: (state, action: PayloadAction<string>) => {
      // ✅ Writes to top-level field — safe from setUser overwrites forever
      state.signupEmail = action.payload;
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.signupEmail = null; // ✅ clear on logout too
    },
  },
});

export const { setUser, logout, setToken, setSignupEmail } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentToken = (state: RootState) => state.auth.access_token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectSignupEmail = (state: RootState) => state.auth.signupEmail; // ✅ reads top-level