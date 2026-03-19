import "dotenv/config"

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI not defined")
}
if(!process.env.FRONTEND_URL){
    throw new Error("FRONTEND_URL not defined")
}
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET not defined")
}
if(!process.env.PORT){
    throw new Error("PORT not defined")
}
if(!process.env.NODE_ENV){
    throw new Error("NODE_ENV not defined")
}
if(!process.env.BACKEND_URL){
    throw new Error("BACKEND_URL not defined")
}

export const envConfig={

   MONGO_URI : process.env.MONGO_URI,
   JWT_SECRET: process.env.JWT_SECRET,
   FRONTEND_URL : process.env.FRONTEND_URL,
   PORT:process.env.PORT ,
   NODE_ENV:process.env.NODE_ENV,
   BACKEND_URL:process.env.BACKEND_URL

}