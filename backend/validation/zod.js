import {z} from "zod"
export function errorParser(error){
    return (JSON.parse(error.message).map((e)=>({
    field:e.path[0],
    message:e.message
})))
}



export const signUpSchema=z.object({
    fullName:z.string().min(3).max(50),
    email:z.email(),
    password:z.string().min(8).max(20),
    role:z.enum(["creator","subscriber"])

})

export const loginSchema=z.object({
    email:z.email(),
    password:z.string().min(8).max(20),

})