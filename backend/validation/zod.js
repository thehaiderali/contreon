import {z,treeifyError} from "zod"
const UserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});





export function errorParser(error){
    return (JSON.parse(error.message).map((e)=>({
    field:e.path[0],
    message:e.message
})))
}