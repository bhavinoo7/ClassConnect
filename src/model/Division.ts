import mongoose,{Schema,Document} from "mongoose";

export interface Division extends Document{
    division_name:string;
    division_code:string;
    mentor:Array<mongoose.Schema.Types.ObjectId>;
    time_table:Array<mongoose.Schema.Types.ObjectId>;
    timestamp:Date;
    batchs:Array<mongoose.Schema.Types.ObjectId>;
    hodid:mongoose.Schema.Types.ObjectId;
    attendance:Array<mongoose.Schema.Types.ObjectId>;
    students:Array<mongoose.Schema.Types.ObjectId>;
    department:mongoose.Schema.Types.ObjectId; 
}

export interface Batch extends Document{
    batch_name:string;
    batch_code:string;
    students:Array<mongoose.Schema.Types.ObjectId>;
    division:Array<Division>;
    timestamp:Date;
}

export interface DivisionAttendance extends Document{   
    division_id:mongoose.Schema.Types.ObjectId;
    date:Date;
    session_id:Array<mongoose.Schema.Types.ObjectId>;
    session_name:string;
    Attendance:Array<mongoose.Schema.Types.ObjectId>;
    teacher_id:mongoose.Schema.Types.ObjectId;
}


    

const BatchSchema:Schema<Batch>=new Schema({
    batch_name:{
        type:String,
        required:[true,"Batch Name is required"],
    },
    batch_code:{
        type:String,
        required:[true,"Batch Code is required"],
        unique:true
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        default:null
    }],
    division:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Division",
        default:null
    }],
    timestamp:{
        type:Date,
        default:Date.now
    }
})



const DivisionSchema:Schema<Division>=new Schema({
    division_name:{
        type:String,
        required:[true,"Division Name is required"],
    },
    division_code:{
        type:String,
        required:[true,"Division Code is required"],
        unique:true
    },
    mentor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Teacher",
        default:null,
        max:3
    }]
    ,
    time_table:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TimeTable",
        default:null
    }],
    timestamp:{
        type:Date,
        default:Date.now
    },
    batchs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Batch",
        default:null
    }],
    attendance:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DivisionAttendance",
        default:null
    }],
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        default:null
    }],
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department",
        default:null
    },
    hodid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hod",
        default:null
    }

})

const DivisionAttendanceSchema:Schema<DivisionAttendance>=new Schema({
    division_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Division",
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    session_id:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Session",
        default:null
    }],
    session_name:{
        type:String,
        required:true
    },
    Attendance:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Attendance",
        default:null
    }
    ]
})

export const Division = ((mongoose.models.Division as mongoose.Model<Division>) ||mongoose.model<Division>("Division",DivisionSchema));

export const Batch = ((mongoose.models.Batch as mongoose.Model<Batch>) ||mongoose.model<Batch>("Batch",BatchSchema));

export const DivisionAttendance=((mongoose.models.DivisionAttendance as mongoose.Model<DivisionAttendance>) ||mongoose.model<DivisionAttendance>("DivisionAttendance",DivisionAttendanceSchema));

