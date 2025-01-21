import exp from "constants";
import mongoose from "mongoose";

type connectionObject={
    isConnected?:number
}

const connection:connectionObject={}

async function dbConnection():Promise<void> {
    if(connection.isConnected)
    {
        console.log("DateBase Already connected");
        return;
    }
    try{
        const db=await mongoose.connect(`${process.env.MONGO_URL}`);
        connection.isConnected=db.connections[0].readyState;
        console.log("Db connected succefully");
    }catch(err)
    {
        console.log("Database connection failed",err);
        process.exit(1);
    }
    
}

export default dbConnection;