import mongoose from "mongoose";
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { creatorProfileSchema, errorParser, updateCreatorProfileSchema } from "../validation/zod.js";
import stripe from "../config/stripe.js";
import { subscriptionTierSchema } from "../validation/zod.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";

export async function getCreatorProfileById(req, res) {
  try {
    const creatorId = req.params.creatorId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator Not Found" });
    }

    const profile = await CreatorProfile.findOne({ creatorId: creator._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator Profile not Found" });
    }

    return res.status(200).json({ success: true, data: { profile } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function getMyCreatorProfile(req, res) {
  try {
    const creatorId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const profile = await CreatorProfile.findOne({ creatorId });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator Profile not Found" });
    }

    return res.status(200).json({ success: true, data: { profile } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function getCreatorById(req, res) {
  try {
    const creatorId = req.params.creatorId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator Not Found" });
    }

    return res.status(200).json({ success: true, data: { creator } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function makeCreatorProfile(req, res) {
  try {
    const creatorId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator not Found" });
    }

    const validationResult = creatorProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: errorParser(validationResult.error)
      });
    }

    const validatedData = validationResult.data;

    const existingProfile = await CreatorProfile.findOne({ creatorId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: "Creator profile already exists for this user"
      });
    }

    const existingPageUrl = await CreatorProfile.findOne({ pageUrl: validatedData.pageUrl });
    if (existingPageUrl) {
      return res.status(400).json({
        success: false,
        error: "Page URL already taken. Please choose a different URL"
      });
    }

    const creatorProfile = await CreatorProfile.create({
      creatorId,
      bio: validatedData.bio,
      pageName: validatedData.pageName,
      pageUrl: validatedData.pageUrl,
      profileImageUrl: validatedData.profileImageUrl || '',
      bannerUrl: validatedData.bannerUrl || '',
      socialLinks: validatedData.socialLinks || [],
      aboutPage: validatedData.aboutPage || ''
    });

    await User.findByIdAndUpdate(creatorId, { onBoarded: true }, { new: true });

    return res.status(201).json({
      success: true,
      message: "Creator profile created successfully",
      data: {
        profile: creatorProfile,
        onBoarded: true
      }
    });

  } catch (error) {
    console.error("Error in makeCreatorProfile:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}`
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export async function updateCreatorProfile(req, res) {
    try {
        const creatorId = req.user?.userId;

        if (!mongoose.Types.ObjectId.isValid(creatorId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid Creator Id" 
            });
        }

        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ 
                success: false, 
                error: "Creator not Found" 
            });
        }

        const existingProfile = await CreatorProfile.findOne({ creatorId });
        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                error: "Creator profile not found. Please create a profile first"
            });
        }

        const validationResult = updateCreatorProfileSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: errorParser(validationResult.error)
            });
        }

        const validatedData = validationResult.data;

        if (validatedData.pageUrl && validatedData.pageUrl !== existingProfile.pageUrl) {
            const existingPageUrl = await CreatorProfile.findOne({ 
                pageUrl: validatedData.pageUrl,
                creatorId: { $ne: creatorId } 
            });
            
            if (existingPageUrl) {
                return res.status(400).json({
                    success: false,
                    error: "Page URL already taken. Please choose a different URL"
                });
            }
        }

        const updateData = {};
        if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
        if (validatedData.pageName !== undefined) updateData.pageName = validatedData.pageName;
        if (validatedData.pageUrl !== undefined) updateData.pageUrl = validatedData.pageUrl;
        if (validatedData.profileImageUrl !== undefined) updateData.profileImageUrl = validatedData.profileImageUrl;
        if (validatedData.bannerUrl !== undefined) updateData.bannerUrl = validatedData.bannerUrl;
        if (validatedData.socialLinks !== undefined) updateData.socialLinks = validatedData.socialLinks;
        if (validatedData.aboutPage !== undefined) updateData.aboutPage = validatedData.aboutPage;

        updateData.updatedAt = new Date();

        const updatedProfile = await CreatorProfile.findOneAndUpdate(
            { creatorId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Creator profile updated successfully",
            data: {
                profile: updatedProfile,
                updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
            }
        });

    } catch (error) {
        console.error("Error in updateCreatorProfile:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists. Please use a different ${field}`
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Database validation failed",
                error: Object.values(error.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}


export async function creatorConnectStripe(req,res){
  
  try {
    const user=await User.findById(req.user.userId);
    const account=await stripe.accounts.create({
      type:"express",
      country:"US",
      email:user.email,
      capabilities:{
        card_payments:{
          requested:true,
        },
        transfers:{
          requested:true,
        }
      },
      business_type:"individual",
      metadata:{
        platform_user_id:user._id.toString()
      }
    })
     const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:5173/creator/onboarding/refresh',
      return_url: 'http://localhost:5173/creator/onboarding/success',
      type: 'account_onboarding',
    });
    
    await User.findByIdAndUpdate(user._id,{connectedID:account.id,isConnected:true})
    return res.status(200).json({
      success:true,
      data:{
        accountId:account.id,
        onboardingUrl:accountLink.url
      }
    })
    

  } catch (error) {

    console.log("Error in Creating Creator Stripe Connect : ",error);
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
    
  }

}


export async function checkStripeStatus(req,res){
  try {

    const account = await stripe.accounts.retrieve();
    
    const isOnboarded = account.charges_enabled && 
                        account.payouts_enabled &&
                        account.details_submitted;
   return res.json({
      accountId: account.id,
      onboarded: isOnboarded,
      requirements: account.requirements,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


export async function createMembership(req,res){
  
  try {
    
    const {success,data,error:ZodError}=subscriptionTierSchema.safeParse(req.body);
    if(!success){
      return res.status(400).json({
        success:false,
        error:errorParser(ZodError)
      })
    }
    const user=await User.findByID(req.user.userId);
    const already=await SubscriptionTier.findOne({tierName:data.tierName,creatorId:user._id});
    if(already){
      return res.status(409).json({
          success:false,
          error:"Membership with Same Name Already Exists. Please Try Again"
      })
    }

    const product=await stripe.products.create({
      name:`Creater-${user._id.toString()}-${data.tierName}`,
      metadata:{
        creator_account:user._id.toString()
      }
    },{
      stripeAccount:user.connectedID
    })

    const price=stripe.prices.create({
      product:product.id,
      unit_amount:data.price,
      currency:"usd",
      recurring:{
        interval:"month"
      },
      metadata:{
        creater_account:user.connectedID
      }
    },{
      stripeAccount:user.connectedID
    })
    const newMembership=new SubscriptionTier({
      creatorId:req.user.userId.toString(),
      tierName:data.tierName,
      price:data.price,
      description:data.description,
      perks:data.perks,
      stripeProductId:product.id,
      stripePriceId:price.id

    })
    await newMembership.save()

    return res.status(201).json({
      success:true,
      data:{
        membership:newMembership
      }
    })

  } catch (error) {
     console.log("Error in Creating Membership : ",error);
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }

}



export async function getAllCreatorProducts(req,res){
   try {
    const creator=User.findById(req.user.userId)
    const products = await stripe.products.list({
      limit: 100,
      metadata: {
        creator_account: creator.connectedID,
      },
    }, {
      stripeAccount:creator.connectedID
    });
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        }, {
          stripeAccount: req.params.creatorAccountId,
        });
        
        return {
          ...product,
          prices: prices.data,
        };
      })
    );
   return res.status(200).json({
    success:true,
    data:{
      products:productsWithPrices
    }
   })
  } catch (error) {
   console.log("Error in Getting Products for Creator : ",error);
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }
}