import {z} from "zod"
export function errorParser(error){
    return (JSON.parse(error.message).map((e)=>({
    field:e.path[0],
    message:e.message
})))
}