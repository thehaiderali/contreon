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
if(!process.env.UPLOADTHING_TOKEN){
    throw new Error("UPLOADTHING_TOKEN not defined")
}
if(!process.env.STRIPE_SECRET_KEY){
    throw new Error("Stripe Secret Key Undefiend not defined")
}
if(!process.env.STRIPE_WEBHOOK_SECRET){
    throw new Error("STRIPE_WEBHOOK_SECRET not defined")
}

if(!process.env.PLATFORM_FEE){
    throw new Error("PLATFORM_FEE not defined")
}
if(!process.env.ASSEMBLY_API_KEY){
    throw new Error("ASSEMBLY_API_KEY not defined")
}
if(!process.env.MUX_SECRET_KEY){
    throw new Error("MUX_SECRET_KEY not defined")
}
if(!process.env.MUX_ACCESS_TOKEN){
    throw new Error("MUX_ACCESS_TOKEN not defined")
}
if(!process.env.MUX_SIGNING_KEY_ID){
    throw new Error("MUX_SIGNING_KEY_ID not defined")
}
if(!process.env.MUX_SIGNING_PRIVATE_KEY){
    throw new Error("MUX_SIGNING_PRIVATE_KEY not defined")
}
if(!process.env.RESEND_API_KEY){
    throw new Error("RESEND_API_KEY not defined")
}


export const envConfig={

   MONGO_URI : process.env.MONGO_URI,
   JWT_SECRET: process.env.JWT_SECRET,
   FRONTEND_URL : process.env.FRONTEND_URL,
   PORT:process.env.PORT ,
   NODE_ENV:process.env.NODE_ENV,
   BACKEND_URL:process.env.BACKEND_URL,
   UPLOADTHING_TOKEN:process.env.UPLOADTHING_TOKEN,
   STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,
   STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
   PLATFORM_FEE:process.env.PLATFORM_FEE,
   ASSEMBLY_API_KEY:process.env.ASSEMBLY_API_KEY,
    MUX_ACCESS_TOKEN:process.env.MUX_ACCESS_TOKEN,
    MUX_SECRET_KEY:process.env.MUX_SECRET_KEY,
    MUX_SIGNING_PRIVATE_KEY:process.env.MUX_SIGNING_PRIVATE_KEY,
    MUX_SIGNING_KEY_ID:process.env.MUX_SIGNING_KEY_ID,
   RESEND_API_KEY:process.env.RESEND_API_KEY,
   EMAIL_FROM: process.env.EMAIL_FROM || 'Contreon <noreply@contreon.com>'
}