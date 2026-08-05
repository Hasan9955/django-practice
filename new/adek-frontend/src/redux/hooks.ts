import { RootState, AppDispatch, AppStore } from "@/redux/store";
import { useDispatch, useSelector, useStore } from "react-redux";
// import type { RootState, AppDispatch, AppStore } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// lib/hooks.ts
// Get logged-in user info from Redux auth slice
export const useAuthUser = () => {
  const user = useAppSelector((state) => state.auth.user);
  return user;
};
