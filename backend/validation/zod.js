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


export const creatorProfileSchema = z.object({
    bio: z.string().min(10).max(80),
    pageName: z.string().min(3).max(20),
    pageUrl: z.string().min(3).max(30),
    profileImageUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
    socialLinks: z.array(z.string().url()).optional(),
    aboutPage: z.string().max(200).optional(),
})

export const subscriptionTierSchema = z.object({
    tierName: z.enum(["regular", "premium"]),
    price: z.number().positive(),
    description: z.string().optional(),
    perks: z.array(z.string()).optional(),
    
})

export const subscriptionSchema = z.object({
    creatorId: z.string().min(1),
    tierType: z.enum(["regular", "premium"]),
})