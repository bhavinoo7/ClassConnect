import mongoose from "mongoose";

export interface Principal extends mongoose.Document {
    name: string;
    email: string;
    contact_no: number;
    departments: Array<mongoose.Schema.Types.ObjectId>;
    techers: Array<mongoose.Schema.Types.ObjectId>;
    userid: mongoose.Schema.Types.ObjectId;
}

export const PrincipalSchema: mongoose.Schema<Principal> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
    },
    contact_no: {
        type: Number,
        required: [true, "contact no is required"],
        unique: true,
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null
    }],
    techers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null
    }],
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
});