/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cartReducer from "./features/cart/cartSlice";

import { configureStore } from "@reduxjs/toolkit";
// import storage from "redux-persist/lib/storage";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import authReducer from "./features/auth/authSlice";
import orderReducer from "./features/payment/orderSlice";
import chatReducer from "./features/chat/chatSlice";
import currencyReducer from "./features/currency/currencySlice";
import { baseApi } from "./api/baseApi";

const createNoopStorage = () => {
  return {
    getItem(_key: string): Promise<null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any): Promise<any> {
      return Promise.resolve(value);
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistAuthConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);
const persistOrderConfig = {
  key: "order",
  storage,
};
const persistedOrderReducer = persistReducer(persistOrderConfig, orderReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: persistedAuthReducer,
      cart: cartReducer,
      order: persistedOrderReducer,
      chat: chatReducer, // ← Integrated here (non-persisted by default)
      currency: currencyReducer,
    },
    middleware: (getDefaultMiddlewares) =>
      getDefaultMiddlewares({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(baseApi.middleware),
  });
};

export const store = makeStore();
export const persistor = persistStore(store);

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
