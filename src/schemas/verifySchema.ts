import {z} from "zod";

export const verifySchema=z.object({
    code:z.string().length(6,"Length of code is 6")
})