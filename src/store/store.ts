import { configureStore, createSlice } from "@reduxjs/toolkit";
import userSlice from "./slice/user";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { combineReducers } from "redux";
import teacherattendanceSlice from "./slice/teacherattendance";
import notificationSlice from "./slice/notification";
const persistConfig = {
  key: "root",
  storage, // Saves state to localStorage
  
};
import timetableslice from "./slice/timetable";

const rootReducer = combineReducers({
  user: persistReducer(persistConfig, userSlice.reducer),
  teacherattendance: persistReducer(persistConfig,teacherattendanceSlice.reducer),
  timetable:persistReducer(persistConfig,timetableslice.reducer),
  notification:persistReducer(persistConfig,notificationSlice.reducer)
});


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for Redux Persist
    }),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore  = typeof store;

