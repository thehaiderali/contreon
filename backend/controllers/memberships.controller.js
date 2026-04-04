import SubscriptionTier from "../models/subscriptionTier.model.js"

export async function getAllMemberships(req,res){
    try {
       
      const memberships=await SubscriptionTier.find({});
      return res.status(200).json({
        success:true,
        data:{
            memberships
        }
      })  

    } catch (error) {
        console.log("Error in Getting Membrships")
    }
}