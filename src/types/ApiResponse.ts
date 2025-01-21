import mongoose from "mongoose";


export interface ApiResponse{
    success:boolean;
    message:string;
}

export enum userRole{
    Student="STUDENT",
    Teacher="TEACHER",
    Admin="ADMIN",
    Hod="HOD",
    pricipal="PRINCIPAL"
}

export enum gender{
    Male="Male",
    Female="Female"
}

export enum division{
    A="CS-A",
    B="CS-B",
    C="CS-C",
    D="CS-D"
}

export type WeeklySchedule = {
    [day in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday']: TimeSlot[];
};

export interface TimeSlot {
    start_time: string; // E.g., "09:00 AM"
    end_time: string;   // E.g., "10:00 AM"
    subject: mongoose.Schema.Types.ObjectId; // Reference to the Subject schema
    teacher: mongoose.Schema.Types.ObjectId; // Reference to the Teacher schema
    classroom: mongoose.Schema.Types.ObjectId; // Reference to the Classroom schema
}
