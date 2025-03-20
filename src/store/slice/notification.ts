import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    setNotification: (state, action) => {
      state.notifications = action.payload;
    },
    removeNotification: (state) => {
      state.notifications = [];
    },
    setUnread: (state, action) => {
      state.unreadCount = action.payload;
    },
    removeUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const NotificationActions = notificationSlice.actions;
export default notificationSlice;
