import { configureStore, createSlice } from "@reduxjs/toolkit";
import userSlice from "./slice/user";
import { combineReducers } from "@reduxjs/toolkit";
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const rootReducer = combineReducers({
  user: userSlice.reducer,
});

const persistConfig = {
  key:"root",
  storage,
  version:1,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(
    {serializableCheck: false}
  )
  
});

export type RootState = ReturnType<typeof store.getState>;
export const persistor = persistStore(store);

