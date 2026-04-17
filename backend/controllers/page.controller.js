import CreatorProfile from "../models/profile.model.js";

export async function getCreatorProfileForPage(req,res){

    try {
     const {creatorUrl}=req.params;   
     const profile=await CreatorProfile.findOne({
        pageUrl:creatorUrl
     })   
     if(profile){
        return res.status(200).json({
            success:true,
            data:{
                profile
            }
        })
     }

    } catch (error) {
     
     console.log("Error in Getting Creator Profile for Creator Page :",error);
     return res.status(500).json({
        success:false,
        error:"Internal Server Error"
     })   
        
    }

}