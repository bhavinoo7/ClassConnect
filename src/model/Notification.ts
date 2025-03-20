import mongoose from "mongoose";

interface Notification extends mongoose.Document {
  message: string;
  timestamp: Date;
  title: string;
  read: boolean;
  sender: string;
  recipient: string;
  source: string;
  type: string;
}

interface sendNotification {
  message: string;
  recipients: Array<mongoose.Schema.Types.ObjectId>;
  sender: string;
  title: string;
  timestamp: string;
  type: string;
  recipient: string;
  trecipients: Array<mongoose.Schema.Types.ObjectId>;
}

const NotificationSchema: mongoose.Schema<Notification> = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  title: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const sendNotificationSchema: mongoose.Schema<sendNotification> =
  new mongoose.Schema({
    trecipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
      },
    ],
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        default: null,
      },
    ],
    sender: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<Notification>("Notification", NotificationSchema);

export const sendNotification =
  mongoose.models.sendNotification ||
  mongoose.model<sendNotification>("sendNotification", sendNotificationSchema);
