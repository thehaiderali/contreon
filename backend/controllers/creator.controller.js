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
      if (user.isConnected && user.connectedID) {
      try {
        const existingAccount = await stripe.accounts.retrieve(user.connectedID);
        if (existingAccount.charges_enabled && existingAccount.payouts_enabled) {
          return res.status(400).json({
            success: false,
            error: "Stripe account already connected and verified"
          });
        }
      } catch (err) {
        console.log("Existing Stripe account not found, creating new one");
      }
    }
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
      refresh_url: `${process.env.FRONTEND_URL}/creator/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/creator/onboarding/success`,
      type: "account_onboarding",
    });
    
  await User.findByIdAndUpdate(
      user._id,
      {
        connectedID: account.id,
        isConnected: true,
      },
      { new: true }
    );
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



export async function checkStripeStatus(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.connectedID) {
      return res.status(200).json({
        success: true,
        data: {
          onboarded: false,
          accountId: null,
          requirements: null,
        },
      });
    }

    const account = await stripe.accounts.retrieve(user.connectedID);

    const isOnboarded =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted;

    return res.status(200).json({
      success: true,
      data: {
        accountId: account.id,
        onboarded: isOnboarded,
        requirements: account.requirements,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });
  } catch (error) {
    console.log("Error checking Stripe status:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
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

    const product=await stripe.products.create({
      name:`${data.tierName}`,
      metadata:{
        creator_account:user._id.toString()
      }
    },{
      stripeAccount:user.connectedID
    })

    const price=await stripe.prices.create({
      product:product.id,
      unit_amount:data.price*100,
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



// export async function getAllCreatorProducts(req,res){
//    try {
//     const creator=await User.findById(req.user.userId)
//     const products = await stripe.products.list({
//       limit: 100,
//     }, {
//       stripeAccount:creator.connectedID
//     });
//     const productsWithPrices = await Promise.all(
//       products.data.map(async (product) => {
//         const prices = await stripe.prices.list({
//           product: product.id,
//           active: true,
//         }, {
//           stripeAccount: creator.connectedID,
//         });
        
//         return {
//           ...product,
//           prices: prices.data,
//         };
//       })
//     );
//     console.log("Stripe Response :  ",productsWithPrices)
//    return res.status(200).json({
//     success:true,
//     data:{
//       products:productsWithPrices
//     }
//    })
//   } catch (error) {
//    console.log("Error in Getting Products for Creator : ",error);
//     return res.status(500).json({
//       success:false,
//       error:"Internal Server Error"
//     })
//   }
// }


export async function getAllMembershipsForCreator(req,res){

  try {
    
    const creator =await User.findById(req.user.userId);
    const memberShips=await SubscriptionTier.find({creatorId:creator._id});
    // if(!memberShips){
    //   return res.status(404).json({
    //     success:false,
    //     error:"No Memberships Found"
    //   })
    // }
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

export async function updateMembership(req, res) {
  try {
    const { id } = req.params; // Membership ID from URL
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
      _id: { $ne: id } // Exclude current membership
    });

    if (duplicateMembership) {
      return res.status(409).json({
        success: false,
        error: "Membership with Same Name Already Exists. Please Try Again"
      });
    }

    // Update Stripe product if tier name changed
    if (data.tierName !== existingMembership.tierName) {
      try {
        await stripe.products.update(
          existingMembership.stripeProductId,
          {
            name: `${data.tierName}`,
            metadata: {
              creator_account: user._id.toString()
            }
          },
          {
            stripeAccount: user.connectedID
          }
        );
      } catch (stripeError) {
        console.log("Error updating Stripe product:", stripeError);
        // Don't fail the entire request if Stripe update fails
        // but log the error for debugging
      }
    }

    // Update Stripe price if price changed
    let newStripePriceId = existingMembership.stripePriceId;
    if (data.price !== existingMembership.price) {
      try {
        // Create a new price (Stripe doesn't allow price updates)
        const newPrice = await stripe.prices.create({
          product: existingMembership.stripeProductId,
          unit_amount: data.price * 100,
          currency: "usd",
          recurring: {
            interval: "month"
          },
          metadata: {
            creator_account: user.connectedID
          }
        }, {
          stripeAccount: user.connectedID
        });
        
        newStripePriceId = newPrice.id;
        
        // Optional: Deactivate the old price
        await stripe.prices.update(
          existingMembership.stripePriceId,
          { active: false },
          { stripeAccount: user.connectedID }
        );
      } catch (stripeError) {
        console.log("Error creating new Stripe price:", stripeError);
        return res.status(500).json({
          success: false,
          error: "Failed to update pricing in Stripe"
        });
      }
    }

    // Update the membership in database
    const updatedMembership = await SubscriptionTier.findByIdAndUpdate(
      id,
      {
        tierName: data.tierName,
        price: data.price,
        description: data.description,
        perks: data.perks,
        stripePriceId: newStripePriceId,
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      success: true,
      data: {
        membership: updatedMembership
      },
      message: "Membership updated successfully"
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

    const membership = await SubscriptionTier.findOneAndDelete({
      _id: id,
      creatorId: req.user.userId.toString()
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: "Membership not found"
      });
    }

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