import { session } from "@/model/Teacher";
import {z} from "zod";


export const signInSchema=z.object({
    identifier: z.string(),
    password:z.string().min(5,{message:"Minimum Length is 5"}).max(
        20,{message:"Minimum Length is 20"}
    ),
    session_id:z.string(),
    qemail:z.string(),
})