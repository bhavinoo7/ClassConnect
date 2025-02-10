import { configureStore, createSlice } from "@reduxjs/toolkit";
import userSlice from "./slice/user";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { combineReducers } from "redux";
const rootReducer = combineReducers({
  user: userSlice.reducer,
});
const persistConfig = {
  key: "root",
  storage, // Saves state to localStorage
};


const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for Redux Persist
    }),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore  = typeof store;

