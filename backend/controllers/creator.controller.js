import mongoose from "mongoose";
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { creatorProfileSchema, errorParser, updateCreatorProfileSchema } from "../validation/zod.js";
import { subscriptionTierSchema } from "../validation/zod.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";

import stripe from "../config/stripe.js";
import Subscription from "../models/subscription.model.js";

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
      aboutPage: validatedData.aboutPage || '',
      category: validatedData.category || 'Other' // Default to 'Other' if not provided
    });

    await User.findByIdAndUpdate(creatorId, { hasProfile: true }, { new: true });

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
        if (validatedData.category !== undefined) updateData.category = validatedData.category;

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



export async function createMembership(req,res){
  
  try {
    
    const {success,data,error:ZodError}=subscriptionTierSchema.safeParse(req.body);
    if(!success){
      return res.status(400).json({
        success:false,
        error:errorParser(ZodError)
      })
    }
    const user=await User.findById(req.user.userId);
    const already=await SubscriptionTier.findOne({tierName:data.tierName,creatorId:user._id});
    if(already){
      return res.status(409).json({
          success:false,
          error:"Membership with Same Name Already Exists. Please Try Again"
      })
    }

     const product = await stripe.products.create({
      name: data.tierName,
      description: data.description || `${data.tierName} membership tier`,
      metadata: {
        creatorId: user._id.toString(),
        tierName: data.tierName,
        createdBy: user.email || 'unknown'
      }
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(data.price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: {
        creatorId: user._id.toString(),
        tierName: data.tierName
      }
    });

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
    console.log("MemberShip Created : ",newMembership)
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





export async function getAllMembershipsForCreator(req,res){

  try {
    
    const creator =await User.findById(req.user.userId);
    const memberShips=await SubscriptionTier.find({creatorId:creator._id});
    return res.status(200).json({
      success:true,
      data:{
        memberShips
      }
    })

  } catch (error) {
    console.log("Error in Getting Memberships for Creator : ",error);
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }

}

export async function getMembershipById(req,res){
  try {
    const id=req.params.id;
    const memberShip=await SubscriptionTier.findById(id);
     return res.status(200).json({
      success:true,
      data:{
        memberShip
      }
     })

  } catch (error) {
    console.log("Error in Getting MemberShip By Id : ",error)
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }
}

// export async function updateMembership(req, res) {
//   try {
//     const { id } = req.params; 
//     const { success, data, error: ZodError } = subscriptionTierSchema.safeParse(req.body);
    
//     if (!success) {
//       return res.status(400).json({
//         success: false,
//         error: errorParser(ZodError)
//       });
//     }

//     // Find the user
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found"
//       });
//     }

//     // Find the existing membership
//     const existingMembership = await SubscriptionTier.findOne({
//       _id: id,
//       creatorId: req.user.userId.toString()
//     });

//     if (!existingMembership) {
//       return res.status(404).json({
//         success: false,
//         error: "Membership not found or you don't have permission to edit it"
//       });
//     }

//     // Check if another membership with the same name exists (excluding current one)
//     const duplicateMembership = await SubscriptionTier.findOne({
//       tierName: data.tierName,
//       creatorId: user._id,
//       _id: { $ne: id } // Exclude current membership
//     });

//     if (duplicateMembership) {
//       return res.status(409).json({
//         success: false,
//         error: "Membership with Same Name Already Exists. Please Try Again"
//       });
//     }

//     const updatedMembership = await SubscriptionTier.findByIdAndUpdate(
//       id,
//       {
//         tierName: data.tierName,
//         price: data.price,
//         description: data.description,
//         perks: data.perks,
//         updatedAt: new Date()
//       },
//       { new: true } 
//     );

//     return res.status(200).json({
//       success: true,
//       data: {
//         membership: updatedMembership
//       },
//       message: "Membership updated successfully"
//     });

//   } catch (error) {
//     console.log("Error in Updating Membership: ", error);
//     return res.status(500).json({
//       success: false,
//       error: "Internal Server Error"
//     });
//   }
// }
export async function updateMembership(req, res) {
  try {
    const { id } = req.params; 
    const { success, data, error: ZodError } = subscriptionTierSchema.safeParse(req.body);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(ZodError)
      });
    }

    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Find the existing membership
    const existingMembership = await SubscriptionTier.findOne({
      _id: id,
      creatorId: req.user.userId.toString()
    });

    if (!existingMembership) {
      return res.status(404).json({
        success: false,
        error: "Membership not found or you don't have permission to edit it"
      });
    }

    // Check if another membership with the same name exists (excluding current one)
    const duplicateMembership = await SubscriptionTier.findOne({
      tierName: data.tierName,
      creatorId: user._id,
      _id: { $ne: id }
    });

    if (duplicateMembership) {
      return res.status(409).json({
        success: false,
        error: "Membership with Same Name Already Exists. Please Try Again"
      });
    }

    // UPDATE STRIPE PRODUCT (if name or description changed)
    if (existingMembership.stripeProductId && 
        (existingMembership.tierName !== data.tierName || 
         existingMembership.description !== data.description)) {
      
      await stripe.products.update(existingMembership.stripeProductId, {
        name: data.tierName,
        description: data.description || `${data.tierName} membership tier`,
        metadata: {
          ...existingMembership.metadata,
          tierName: data.tierName,
          updatedAt: new Date().toISOString()
        }
      });
    }

    // HANDLE PRICE CHANGE (create new price, don't delete old one)
    let stripePriceId = existingMembership.stripePriceId;
    
    if (existingMembership.price !== data.price) {
      // Create new price (Stripe doesn't allow price updates)
      const newPrice = await stripe.prices.create({
        product: existingMembership.stripeProductId,
        unit_amount: Math.round(data.price * 100),
        currency: 'usd',
        recurring: {
          interval: 'month',
          interval_count: 1
        },
        metadata: {
          creatorId: user._id.toString(),
          tierName: data.tierName,
          version: Date.now().toString()
        }
      });
      
      stripePriceId = newPrice.id;
      
      // Note: Old price will continue working for existing subscribers
      // New subscribers will get the new price
    }

    // Update in database
    const updatedMembership = await SubscriptionTier.findByIdAndUpdate(
      id,
      {
        tierName: data.tierName,
        price: data.price,
        description: data.description,
        perks: data.perks,
        stripePriceId: stripePriceId, // Update to new price ID if changed
        updatedAt: new Date()
      },
      { new: true } 
    );

    return res.status(200).json({
      success: true,
      data: {
        membership: updatedMembership,
        stripe: {
          productId: updatedMembership.stripeProductId,
          priceId: stripePriceId,
          priceChanged: existingMembership.price !== data.price,
          oldPriceId: existingMembership.price !== data.price ? existingMembership.stripePriceId : null
        }
      },
      message: existingMembership.price !== data.price 
        ? "Membership updated. New price will apply to future subscribers."
        : "Membership updated successfully"
    });

  } catch (error) {
    console.log("Error in Updating Membership: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}



export async function deleteMembership(req, res) {
  try {
    const { id } = req.params;

    // Find the membership
    const membership = await SubscriptionTier.findOne({
      _id: id,
      creatorId: req.user.userId.toString()
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: "Membership not found or you don't have permission to delete it"
      });
    }

    // Check if any active subscriptions use this membership
    const activeSubscriptions = await Subscription.find({
      subscriptionTierId: id,
      status: { $in: ['active', 'trialing', 'past_due'] }
    });

    if (activeSubscriptions.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete membership. ${activeSubscriptions.length} active subscriber(s) found.`
      });
    }

    // OPTION 1: Archive in Stripe (recommended - don't delete)
    if (membership.stripeProductId) {
      await stripe.products.update(membership.stripeProductId, {
        active: false,
        metadata: {
          ...membership.metadata,
          archivedAt: new Date().toISOString(),
          archivedBy: req.user.userId
        }
      });
    }

    await SubscriptionTier.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Membership deleted successfully"
    });

  } catch (error) {
    console.log("Error in Deleting Membership: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}