import http from "http";
import express from "express";
import next from "next";
import { Server as socketIo } from "socket.io";
import Student from "@/model/Student";

import { Teacher, session } from "./src/model/Teacher"; // Corrected import path
import UserModel from "./src/model/User";
import mongoose, { model, ObjectId } from "mongoose"; // Corrected import path
import path from "path";
import { Batch, Division } from "@/model/Division";
import { Attendance } from "@/model/Timetable";
import dotenv from "dotenv";
dotenv.config();
const cluster = require("cluster");
const os = require("os");
const numCPUs = os.cpus().length;

// Initialize Next.js
const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://bhavin:bhavin@cluster0.cs8ai.mongodb.net/"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
connectToDatabase();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();

app.prepare().then(() => {

  const httpServer = http.createServer(server);

  // Initialize Socket.IO with the HTTP serve
  const io = new socketIo(httpServer, {
    path: "/api/socket",
    cors: {
      origin: "*", // Adjust according to your needs
      methods: ["GET", "POST"],
    },
  });

  // Handle WebSocket events
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("post-teacher-data", async (data) => {
      console.log("Received data:", data);
      if (data !== null && data.length > 0) {
        const user1 = await UserModel.findById(data);
        const user = await UserModel.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(data),
            },
          },
          {
            $lookup: {
              from: "teachers",
              localField: "teacherid",
              foreignField: "_id",
              as: "teacherResult",
            },
          },
          {
            $lookup: {
              from: "slots",
              localField: "teacherResult.lectures",
              foreignField: "_id",
              as: "slotResult",
            },
          },
          {
            $unwind: "$slotResult", // Unwind the slotresult array
          },
          {
            $lookup: {
              from: "divisions",
              localField: "slotResult.division_id",
              foreignField: "_id",
              as: "division",
            },
          },
          {
            $unwind: "$division", // Unwind the slotresult array
          },
          {
            $addFields: {
              "slotResult.division_name": "$division.division_name",
            },
          },
          {
            $group: {
              _id: "$_id",
              slots: { $push: "$slotResult" },
            },
          },
          {
            $project: {
              slots: 1,
            },
          },
        ]);
        
        if (user[0].slots) {
          user[0].slots.map(async (slot: any) => {
           
            if (slot.is_lab) {
              console.log("lab");
              const result = slot.lab.filter((lab: any) => {
                return lab.teacher.toString() === user1?.teacherid.toString();
              });
             
              if (result.length > 0) {
                slot.labs = result;
                
              } else {
                slot.labs = [];
              }

              
              const batch = await Batch.findById(slot.labs[0].batch_id);
             
              if (batch) {
                slot.students = batch.students;
              } else {
                slot.students = [];
              }
            } else {
              console.log("lecture");
              const division = await Division.findById(slot.division_id);
            
              if (division) {
                slot.students = division.students;
              } else {
                slot.students = [];
              }
            }
          });
        }
        
        socket.emit("get-teacher-data", { data: user[0].slots });
      }
    });

    socket.on("get-session", async (data) => {
      const { id } = data;
      console.log("AAAAA", data);
      if (data.id) {
        console.log("BBBBB", id);
        const user = await UserModel.findById(id);
        
        const teacher = await Teacher.findById(user?.teacherid);
       
       
        if (teacher.currentent_session !== null) {
          socket.emit("get-session", { data: teacher.currentent_session });
        } else {
          socket.emit("session-not-found");
        }
      }
    });
    
    socket.on("get-student-details", async (data) => {
      const { id } = data;
      console.log("AAAAA", data);
      if (id && id.length > 0) {
        const user = await UserModel.findById(id);
        const student = await Student.findById(user?.studentid);
        
        socket.emit("get-student-details", student);
      }
    });

    



    

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Handle all Next.js requests
  server.all("*", (req, res) => {
    return handle(req, res); // Let Next.js handle the routing
  });

  // Start the server on the desired port
  const PORT = process.env.PORT  ;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });

});


// Add this line to ensure the file is treated as an ES Module
export {};



