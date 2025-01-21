import {z} from "zod";

export const userNameValidation=z.string().min(2,"minimum Length is 2").max(20,"Maximum Length is 20");

export const signUpSchema=z.object({
    userName:userNameValidation,
    email:z.string().email({message:"Invalid Email Adderss"}),
    password:z.string().min(5,{message:"Minimum Length is 5"}).max(
        20,{message:"Minimum Length is 20"}
    ),
    type:z.ZodEnum.create(["Student","Teacher","Admin"])
})