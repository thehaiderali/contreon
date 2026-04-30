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
    role:z.enum(["creator","subscriber","admin"])

})

export const loginSchema=z.object({
    email:z.email(),
    password:z.string().min(8).max(20),

})

// Update creatorProfileSchema to include category
export const creatorProfileSchema = z.object({
    bio: z.string().min(10).max(80),
    pageName: z.string().min(3).max(20),
    pageUrl: z.string().min(3).max(30),
    profileImageUrl: z.url().optional(),
    bannerUrl: z.url().optional(),
    socialLinks: z.array(z.url()).optional(),
    aboutPage: z.string().max(200).optional(),
    category: z.enum(["Tech", "Sports", "Music", "Art", "Other", "Business"]).optional(),
})

// Create update schema that makes category optional
export const updateCreatorProfileSchema = z.object({
    bio: z.string().min(10).max(80).optional(),
    pageName: z.string().min(3).max(20).optional(),
    pageUrl: z.string().min(3).max(30).optional(),
    profileImageUrl: z.url().optional(),
    bannerUrl: z.url().optional(),
    socialLinks: z.array(z.url()).optional(),
    aboutPage: z.string().max(200).optional(),
    category: z.enum(["Tech", "Sports", "Music", "Art", "Other", "Business"]).optional(),
})

export const subscriptionTierSchema = z.object({
    tierName: z.string().min(3).max(30),
    price: z.number().positive(),
    description: z.string().optional(),
    perks: z.array(z.string()).optional(),
    
})

export const subscriptionSchema = z.object({
    creatorId: z.string().min(1),
    tierType: z.enum(["regular", "premium"]),
})

export const collectionSchema=z.object({
    title:z.string().min(3).max(30).trim(),
    description:z.string().min(10).max(100).trim().optional(),
})
export const collectionUpdateSchema=z.object({
    title:z.string().min(3).max(30).trim().optional(),
    description:z.string().min(10).max(100).trim().optional(),
})

export const commentSchema=z.object({
    content:z.string().min(3).max(150)
})